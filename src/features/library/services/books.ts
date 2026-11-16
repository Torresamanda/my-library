import { z } from 'zod'
import { googleCoverId, validCoverUrl } from '../../books/domain/cover'
import {
  mediaTypeSchema,
  ownershipSchema,
  type MediaType,
  type Ownership,
} from '../../books/domain/collection'
import { reviewSchema, type Review } from '../../books/domain/review'

const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  isbn: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
  status: z.enum(['nao_lido', 'lendo', 'concluido', 'abandonado']),
  seriesName: z.string().nullable(),
  seriesVolume: z.number().int().nullable(),
  genres: z.array(z.string()),
  coverUrl: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  pageCount: z.number().int().positive().nullable().optional(),
  favorite: z.boolean().optional(),
  mediaType: mediaTypeSchema.nullable().optional(),
  ownership: ownershipSchema.optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  review: reviewSchema.nullable().optional(),
})
export type LibraryBook = z.infer<typeof bookSchema>

export class LibraryRequestError extends Error {
  constructor(public readonly status: number) {
    super('Não foi possível carregar a biblioteca')
  }
}

export async function fetchBooks(token: string): Promise<LibraryBook[]> {
  const response = await fetch('/api/books', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new LibraryRequestError(response.status)
  const data: unknown = await response.json()
  return z.object({ books: z.array(bookSchema) }).parse(data).books
}

export type BookDraft = {
  title: string
  author: string
  isbn: string | null
  coverUrl?: string | null
  publisher?: string | null
  pageCount?: number | null
  favorite?: boolean
  mediaType?: MediaType | null
  ownership?: Ownership
  rating?: number | null
  review?: Review | null
  quantity: number
  status: LibraryBook['status']
  seriesName: string | null
  seriesVolume: number | null
  genres: string[]
}

export async function createBook(token: string, book: BookDraft): Promise<void> {
  const response = await fetch('/api/books', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  })
  if (!response.ok) throw new LibraryRequestError(response.status)
}

export async function updateBook(token: string, id: string, book: BookDraft): Promise<void> {
  const response = await fetch(`/api/books/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  })
  if (!response.ok) throw new LibraryRequestError(response.status)
}

export async function deleteBook(token: string, id: string): Promise<void> {
  const response = await fetch(`/api/books/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new LibraryRequestError(response.status)
}

const coverSearchResultSchema = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
    title: z.string(),
    authors: z.array(z.string()),
    publisher: z.string(),
    publishedDate: z.string(),
    isbns: z.array(z.string()),
    coverUrl: z.string().refine(validCoverUrl).nullable(),
  })
  .refine((item) => !item.coverUrl || googleCoverId(item.coverUrl) === item.id)
export type CoverSearchResult = z.infer<typeof coverSearchResultSchema>

export async function searchCovers(
  token: string,
  title: string,
  author: string,
  signal?: AbortSignal,
): Promise<CoverSearchResult[]> {
  const response = await fetch('/api/covers/search', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author }),
    signal,
  })
  if (!response.ok) throw new LibraryRequestError(response.status)
  const raw: unknown = await response.json()
  return z.object({ results: z.array(coverSearchResultSchema).max(10) }).parse(raw).results
}
