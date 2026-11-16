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
              {
                title: ' Livro ',
                author_name: ['Autora', 'Outro autor'],
                isbn: ['0306406152'],
                cover_i: 123,
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    )
    expect(await lookupIsbn('9780306406157')).toMatchObject({
      title: 'Livro',
      author: 'Autora, Outro autor',
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

it('retrieves edition author names when the search result omits them', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ docs: [{ title: 'Livro', isbn: ['9780306406157'] }] }), {
        status: 200,
      }),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          authors: [
            { key: '/authors/OL1A' },
            { key: '/authors/OL2A' },
            { key: '/authors/OL1A' },
            { key: '/authors/../../malicious' },
          ],
        }),
        { status: 200 },
      ),
    )
    .mockResolvedValueOnce(new Response(JSON.stringify({ name: 'Autora' }), { status: 200 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ name: 'Outro autor' }), { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  expect(await lookupIsbn('9780306406157')).toMatchObject({
    title: 'Livro',
    author: 'Autora, Outro autor',
    coverUrl: null,
  })
  expect(fetchMock).toHaveBeenCalledTimes(4)
})

it('keeps the title if the edition author lookup fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ docs: [{ title: 'Livro', isbn: ['9780306406157'] }] }), {
          status: 200,
        }),
      )
      .mockRejectedValueOnce(new Error('offline')),
  )
  expect(await lookupIsbn('9780306406157')).toMatchObject({
    title: 'Livro',
    author: '',
    coverUrl: null,
  })
})

it('prefers the title and cover for the ISBN edition and requests Portuguese results', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          docs: [
            {
              title: 'Original title',
              author_name: ['Autora'],
              isbn: ['9780306406157'],
              cover_i: 11,
            },
          ],
        }),
        { status: 200 },
      ),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ title: 'Título da edição brasileira', covers: [22] }), {
        status: 200,
      }),
    )
  vi.stubGlobal('fetch', fetchMock)
  expect(await lookupIsbn('9780306406157')).toMatchObject({
    title: 'Título da edição brasileira',
    author: 'Autora',
    coverUrl: 'https://covers.openlibrary.org/b/id/22-M.jpg',
  })
  const requested = fetchMock.mock.calls[0]?.[0] as URL
  expect(requested.searchParams.get('lang')).toBe('pt')
  expect(fetchMock.mock.calls[1]?.[0]).toBe('https://openlibrary.org/isbn/9780306406157.json')
})

it('falls back to work data when the edition has no usable title or cover', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            docs: [
              {
                title: 'Título disponível',
                author_name: ['Autora'],
                isbn: ['9780306406157'],
                cover_i: 11,
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ title: ' ', covers: [-1, 'invalid'] }), { status: 200 }),
      ),
  )
  expect(await lookupIsbn('9780306406157')).toMatchObject({
    title: 'Título disponível',
    author: 'Autora',
    coverUrl: 'https://covers.openlibrary.org/b/id/11-M.jpg',
  })
})

it('extracts up to four distinct edition subjects and validates optional metadata', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          docs: [{ title: 'Livro', author_name: ['Autora'], isbn: ['9780306406157'] }],
        }),
        { status: 200 },
      ),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          publishers: ['Editora'],
          number_of_pages: 320,
          subjects: ['Fantasia', 'fantasia', 'Romance', 'Comédia', 'Aventura', 'Outro', 'A, B'],
        }),
        { status: 200 },
      ),
    )
  vi.stubGlobal('fetch', fetchMock)
  expect(await lookupIsbn('9780306406157')).toMatchObject({
    publisher: 'Editora',
    pageCount: 320,
    genres: ['Fantasia', 'Romance', 'Comédia', 'Aventura'],
  })
})
