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
