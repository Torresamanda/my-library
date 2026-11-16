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
  authors: z.array(z.object({ key: z.string() })).optional(),
})
const authorSchema = z.object({ name: z.string().optional() })

async function editionAuthors(isbn: string, signal?: AbortSignal): Promise<string> {
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
      signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return ''
    const data: unknown = await response.json()
    const parsed = editionSchema.safeParse(data)
    if (!parsed.success) return ''
    const keys = [
      ...new Set(
        (parsed.data.authors ?? [])
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
  } catch {
    return ''
  }
}

export type LookupResult = { title: string; author: string; coverUrl: string | null }

export async function lookupIsbn(isbn: string, signal?: AbortSignal): Promise<LookupResult | null> {
  const normalized = normalizeIsbn(isbn)
  if (!normalized) throw new Error('ISBN inválido')
  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('isbn', normalized)
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
  const author = authors || (await editionAuthors(normalized, signal))
  return {
    title: (result.title ?? '').trim().slice(0, 250),
    author,
    coverUrl: result.cover_i ? `https://covers.openlibrary.org/b/id/${result.cover_i}-M.jpg` : null,
  }
}
