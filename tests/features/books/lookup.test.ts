import { afterEach, describe, expect, it, vi } from 'vitest'
import { lookupIsbn } from '../../../src/features/books/services/lookup'

afterEach(() => vi.unstubAllGlobals())
describe('ISBN lookup', () => {
  it('accepts only a matching ISBN and constructs a trusted cover URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            docs: [
              { title: 'Outro', isbn: ['9780140328721'], cover_i: 1 },
              { title: ' Livro ', author_name: ['Autora'], isbn: ['0306406152'], cover_i: 123 },
            ],
          }),
          { status: 200 },
        ),
      ),
    )
    expect(await lookupIsbn('9780306406157')).toEqual({
      title: 'Livro',
      author: 'Autora',
      coverUrl: 'https://covers.openlibrary.org/b/id/123-M.jpg',
    })
  })
  it('returns no result and reports invalid input or unavailable service', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ docs: [] }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await lookupIsbn('9780306406157')).toBeNull()
    await expect(lookupIsbn('invalid')).rejects.toThrow()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }))
    await expect(lookupIsbn('9780306406157')).rejects.toThrow()
  })
})
