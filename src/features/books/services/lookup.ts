import { z } from 'zod'
import { normalizeIsbn } from '../domain/isbn'

const resultSchema = z.object({
  docs: z
    .array(
      z.object({
        title: z.string().optional(),
        author_name: z.array(z.string()).optional(),
        isbn: z.array(z.string()).optional(),
        cover_i: z.number().int().positive().safe().optional(),
      }),
    )
    .default([]),
})

const editionSchema = z.object({
  title: z.string().optional(),
  covers: z
    .array(z.unknown())
    .optional()
    .transform((covers) =>
      (covers ?? []).filter(
        (id): id is number =>
          typeof id === 'number' && Number.isSafeInteger(id) && id > 0 && id < 1e16,
      ),
    ),
  authors: z.array(z.object({ key: z.string() })).optional(),
})
const authorSchema = z.object({ name: z.string().optional() })

type Edition = z.infer<typeof editionSchema>

async function fetchEdition(isbn: string, signal?: AbortSignal): Promise<Edition | null> {
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null
    const data: unknown = await response.json()
    const parsed = editionSchema.safeParse(data)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

async function editionAuthors(edition: Edition, signal?: AbortSignal): Promise<string> {
  const keys = [
    ...new Set(
      (edition.authors ?? [])
        .map((author) => author.key)
        .filter((key) => /^\/authors\/OL[1-9][0-9]*A$/.test(key)),
    ),
  ].slice(0, 10)
  const names = await Promise.all(
    keys.map(async (key) => {
      try {
        const authorResponse = await fetch(`https://openlibrary.org${key}.json`, {
          signal,
          headers: { Accept: 'application/json' },
        })
        if (!authorResponse.ok) return ''
        const authorData: unknown = await authorResponse.json()
        const author = authorSchema.safeParse(authorData)
        return author.success ? (author.data.name ?? '').trim() : ''
      } catch {
        return ''
      }
    }),
  )
  return names.filter(Boolean).join(', ').slice(0, 250)
}

export type LookupResult = { title: string; author: string; coverUrl: string | null }

export async function lookupIsbn(isbn: string, signal?: AbortSignal): Promise<LookupResult | null> {
  const normalized = normalizeIsbn(isbn)
  if (!normalized) throw new Error('ISBN inválido')
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('isbn', normalized)
  url.searchParams.set('lang', 'pt')
  url.searchParams.set('fields', 'title,author_name,isbn,cover_i')
  url.searchParams.set('limit', '10')
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Consulta indisponível')
  const data: unknown = await response.json()
  const result = resultSchema
    .parse(data)
    .docs.find((doc) => doc.isbn?.some((value) => normalizeIsbn(value) === normalized))
  if (!result) return null
  const authors = (result.author_name ?? [])
    .map((name) => name.trim())
    .filter(Boolean)
    .join(', ')
    .slice(0, 250)
  const edition = await fetchEdition(normalized, signal)
  const author = authors || (edition ? await editionAuthors(edition, signal) : '')
  const coverId = edition?.covers?.[0] ?? result.cover_i
  return {
    title: (edition?.title?.trim() || result.title?.trim() || '').slice(0, 250),
    author,
    coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
  }
}
