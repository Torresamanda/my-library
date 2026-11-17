import { z } from 'zod'
import { googleCoverId } from '../../src/features/books/domain/cover'

const searchSchema = z
  .object({ title: z.string().trim().max(250), author: z.string().trim().max(250) })
  .strict()
  .refine((query) => query.title.length > 0 || query.author.length > 0)
const itemSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  volumeInfo: z
    .object({
      title: z.string().optional(),
      authors: z.array(z.string()).optional(),
      publisher: z.string().optional(),
      pageCount: z.unknown().optional(),
      categories: z.array(z.string()).optional(),
      publishedDate: z.string().optional(),
      industryIdentifiers: z
        .array(z.object({ type: z.string(), identifier: z.string() }))
        .optional(),
      imageLinks: z
        .object({ thumbnail: z.string().optional(), smallThumbnail: z.string().optional() })
        .optional(),
    })
    .optional(),
})
const responseSchema = z.object({ items: z.array(itemSchema).max(10).optional() })
export async function searchGoogleBooks(
  raw: unknown,
  key: string | undefined,
): Promise<{ status: number; body: object }> {
  const query = searchSchema.safeParse(raw)
  if (!query.success)
    return { status: 400, body: { error: 'Informe o título ou o autor para pesquisar.' } }
  if (!key) return { status: 503, body: { error: 'Pesquisa de capas ainda não configurada.' } }
  const terms = [query.data.title, query.data.author].filter(Boolean).join(' ')
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', terms)
  url.searchParams.set('maxResults', '10')
  try {
    const response = await fetch(url, {
      headers: { 'X-Goog-Api-Key': key, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok)
      return { status: 503, body: { error: 'Não foi possível pesquisar capas agora.' } }
    const rawResponse: unknown = await response.json()
    const parsed = responseSchema.safeParse(rawResponse)
    if (!parsed.success)
      return { status: 502, body: { error: 'Não foi possível interpretar os resultados.' } }
    const results = (parsed.data.items ?? []).map(({ id, volumeInfo: info }) => {
      const seenGenres = new Set<string>()
      const candidate = (
        info?.imageLinks?.thumbnail ??
        info?.imageLinks?.smallThumbnail ??
        ''
      ).replace(/^http:\/\//, 'https://')
      return {
        id,
        title: (info?.title ?? '').trim().slice(0, 250),
        authors: (info?.authors ?? []).slice(0, 10).map((value) => value.slice(0, 250)),
        publisher: (info?.publisher ?? '').slice(0, 250),
        pageCount:
          typeof info?.pageCount === 'number' &&
          Number.isInteger(info.pageCount) &&
          info.pageCount > 0 &&
          info.pageCount <= 1000000
            ? info.pageCount
            : null,
        genres: (info?.categories ?? [])
          .map((value) => value.trim())
          .filter((value) => {
            const key = value.toLocaleLowerCase('pt-BR')
            if (!value || value.length > 80 || value.includes(',') || seenGenres.has(key))
              return false
            seenGenres.add(key)
            return true
          })
          .slice(0, 4),
        publishedDate: (info?.publishedDate ?? '').slice(0, 40),
        isbns: (info?.industryIdentifiers ?? [])
          .filter((value) => value.type === 'ISBN_10' || value.type === 'ISBN_13')
          .map((value) => value.identifier.slice(0, 32))
          .slice(0, 5),
        coverUrl: googleCoverId(candidate) === id ? candidate : null,
      }
    })
    return { status: 200, body: { results } }
  } catch {
    return { status: 503, body: { error: 'Não foi possível pesquisar capas agora.' } }
  }
}
