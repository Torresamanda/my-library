import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchBooks, LibraryRequestError } from '../../../src/features/library/services/books'

afterEach(() => vi.unstubAllGlobals())
describe('library API client', () => {
  it('uses the token in a header and reads a valid collection', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ books: [] }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchBooks('test-token')).toEqual([])
    expect(fetchMock).toHaveBeenCalledWith('/api/books', {
      headers: { Authorization: 'Bearer test-token' },
      cache: 'no-store',
    })
  })
  it('rejects unauthorized and malformed responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })))
    await expect(fetchBooks('invalid')).rejects.toBeInstanceOf(LibraryRequestError)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ books: [{}] }), { status: 200 })),
    )
    await expect(fetchBooks('test-token')).rejects.toThrow()
  })
})

it('sends a new book with authorization and reports duplicate ISBNs', async () => {
  const { createBook } = await import('../../../src/features/library/services/books')
  const book = {
    title: 'Livro',
    author: 'Autora',
    isbn: '9780306406157',
    quantity: 2,
    status: 'lendo' as const,
    seriesName: null,
    seriesVolume: null,
    genres: ['Fantasia'],
  }
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 409 }))
  vi.stubGlobal('fetch', fetchMock)
  await expect(createBook('test-token', book)).rejects.toMatchObject({ status: 409 })
  expect(fetchMock).toHaveBeenCalledWith('/api/books', {
    method: 'POST',
    headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  })
})

it('edits and deletes through authenticated requests and reports failures', async () => {
  const { updateBook, deleteBook } = await import('../../../src/features/library/services/books')
  const book = {
    title: 'Livro',
    author: 'Autora',
    isbn: null,
    quantity: 1,
    status: 'lendo' as const,
    seriesName: null,
    seriesVolume: null,
    genres: [],
  }
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 200 }))
    .mockResolvedValueOnce(new Response(null, { status: 409 }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(new Response(null, { status: 401 }))
  vi.stubGlobal('fetch', fetchMock)
  await updateBook('token', 'book-id', book)
  expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/books/book-id', {
    method: 'PUT',
    headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  })
  await expect(updateBook('token', 'book-id', book)).rejects.toMatchObject({ status: 409 })
  await deleteBook('token', 'book-id')
  expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/books/book-id', {
    method: 'DELETE',
    headers: { Authorization: 'Bearer token' },
  })
  await expect(deleteBook('token', 'book-id')).rejects.toMatchObject({ status: 401 })
})
