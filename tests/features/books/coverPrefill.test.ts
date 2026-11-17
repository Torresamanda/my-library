import { describe, expect, it } from 'vitest'
import { prefillFromCover } from '../../../src/features/books/domain/coverPrefill'
import type { CoverSearchResult } from '../../../src/features/library/services/books'

const result: CoverSearchResult = {
  id: 'example',
  title: 'Título',
  authors: ['Autora'],
  publisher: 'Editora',
  pageCount: 240,
  genres: ['Fantasia'],
  publishedDate: '2020',
  isbns: ['9780306406157'],
  coverUrl: null,
}
const blank = { title: '', author: '', publisher: '', pageCount: '', genres: '', isbn: '' }

describe('cover metadata prefill', () => {
  it('fills empty fields without changing ISBN for matching or ISBN-free books', () => {
    expect(prefillFromCover(blank, result)).toMatchObject({
      title: 'Título',
      author: 'Autora',
      publisher: 'Editora',
      pageCount: '240',
      genres: 'Fantasia',
      isbn: '',
    })
    expect(prefillFromCover({ ...blank, isbn: '0-306-40615-2' }, result).publisher).toBe('Editora')
  })
  it('preserves entered values and refuses metadata for a different or unverified edition', () => {
    expect(
      prefillFromCover({ ...blank, title: 'Meu título', publisher: 'Minha editora' }, result),
    ).toMatchObject({ title: 'Meu título', publisher: 'Minha editora' })
    const other = { ...blank, isbn: '080442957X' }
    expect(prefillFromCover(other, result)).toEqual(other)
    expect(
      prefillFromCover({ ...blank, isbn: '9780306406157' }, { ...result, isbns: [] }).publisher,
    ).toBe('')
  })
  it('leaves absent data empty', () => {
    const missing = {
      ...result,
      title: '',
      authors: [],
      publisher: '',
      pageCount: null,
      genres: [],
    }
    expect(prefillFromCover(blank, missing)).toEqual(blank)
  })
})
