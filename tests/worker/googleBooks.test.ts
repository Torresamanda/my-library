import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchGoogleBooks } from '../../worker/books/googleBooks'
import { googleCoverId, validCoverUrl } from '../../src/features/books/domain/cover'

afterEach(() => vi.unstubAllGlobals())

describe('Google Books cover search', () => {
  it('requires a configured key and validates the search', async () => {
    expect((await searchGoogleBooks({ title: '', author: '' }, 'example')).status).toBe(400)
    expect((await searchGoogleBooks({ title: 'Livro', author: '' }, undefined)).status).toBe(503)
  })

  it('keeps result order and sends the key in a header', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 'first',
              volumeInfo: {
                title: 'Livro',
                publisher: 'Editora',
                pageCount: 320,
                categories: ['Fantasia', 'fantasia', 'Romance'],
                imageLinks: {
                  thumbnail:
                    'http://books.google.com/books/content?id=first&printsec=frontcover&img=1&zoom=1',
                },
              },
            },
            {
              id: 'second',
              volumeInfo: {
                title: 'Outra edição',
                imageLinks: { thumbnail: 'https://evil.example/image' },
              },
            },
          ],
        }),
      ),
    )
    vi.stubGlobal('fetch', fetcher)
    const result = await searchGoogleBooks({ title: 'Livro', author: 'Autora' }, 'example-key')
    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({
      results: [
        {
          id: 'first',
          publisher: 'Editora',
          pageCount: 320,
          genres: ['Fantasia', 'Romance'],
          coverUrl: expect.stringContaining('https://books.google.com/'),
        },
        { id: 'second', coverUrl: null },
      ],
    })
    expect(String(fetcher.mock.calls[0]![0])).not.toContain('example-key')
    expect(fetcher.mock.calls[0]![1].headers['X-Goog-Api-Key']).toBe('example-key')
  })

  it('ignores invalid page counts and unavailable metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ items: [{ id: 'example', volumeInfo: { pageCount: -1 } }] }),
          ),
        ),
    )
    const result = await searchGoogleBooks({ title: 'Livro', author: '' }, 'example')
    expect(result.body).toMatchObject({ results: [{ title: '', pageCount: null, genres: [] }] })
  })

  it('handles provider failures without exposing details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('private details')))
    const result = await searchGoogleBooks({ title: 'Livro', author: '' }, 'example')
    expect(result.status).toBe(503)
    expect(JSON.stringify(result)).not.toContain('private details')
  })
})

describe('cover URLs', () => {
  it('allows known providers and rejects forged or dangerous URLs', () => {
    expect(googleCoverId('https://books.google.com/books/content?id=abc&zoom=1')).toBe('abc')
    expect(validCoverUrl('https://covers.openlibrary.org/b/id/123-M.jpg')).toBe(true)
    for (const url of [
      'javascript:alert(1)',
      'https://books.google.com.evil.example/books/content?id=abc',
      'https://books.google.com/books/content?id=abc&id=def',
      'https://books.google.com/books/content?id=abc&url=evil',
    ])
      expect(validCoverUrl(url)).toBe(false)
  })
})
