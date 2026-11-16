import { z } from 'zod'

const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  quantity: z.number().int().positive(),
  status: z.enum(['nao_lido', 'lendo', 'concluido', 'abandonado']),
  seriesName: z.string().nullable(),
  seriesVolume: z.number().int().nullable(),
  genres: z.array(z.string()),
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
