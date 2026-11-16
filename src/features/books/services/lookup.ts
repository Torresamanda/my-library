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
  return {
    title: (result.title ?? '').trim().slice(0, 250),
    author: (result.author_name ?? []).join(', ').trim().slice(0, 250),
    coverUrl: result.cover_i ? `https://covers.openlibrary.org/b/id/${result.cover_i}-M.jpg` : null,
  }
}
