import { describe, expect, it } from 'vitest'
import { validateBookFields } from '../../../src/features/books/domain/bookFormValidation'

const valid = {
  title: 'Livro',
  author: 'Autora',
  isbn: '',
  genres: '',
  seriesName: '',
  seriesVolume: '',
  pageCount: '',
  quantity: 1,
}
describe('validation across book form steps', () => {
  it('allows saving with only required fields and validates ISBN', () => {
    expect(validateBookFields(valid, false, false)).toBeNull()
    expect(validateBookFields({ ...valid, title: ' ' }, false, false)).toMatchObject({
      step: 0,
      field: 'book-title',
    })
    expect(validateBookFields({ ...valid, isbn: '123' }, false, false, true)).toMatchObject({
      step: 0,
      field: 'book-isbn',
    })
  })
  it('returns the right hidden step and field for invalid optional data', () => {
    expect(validateBookFields({ ...valid, seriesVolume: '2' }, false, false)).toMatchObject({
      step: 1,
      field: 'book-series',
      expandEdition: true,
    })
    expect(validateBookFields({ ...valid, pageCount: '0' }, false, false)).toMatchObject({
      step: 1,
      field: 'book-pages',
      expandEdition: true,
    })
    expect(validateBookFields({ ...valid, quantity: 0 }, true, false)).toMatchObject({
      step: 1,
      field: 'book-quantity',
    })
    expect(validateBookFields(valid, false, true)).toMatchObject({
      step: 2,
      field: 'review-editor',
    })
  })
  it('rejects duplicate genres and invalid volumes without blocking non-owned copies', () => {
    expect(
      validateBookFields({ ...valid, genres: 'Fantasia, fantasia' }, false, false),
    ).toMatchObject({ step: 1, field: 'book-genres' })
    expect(
      validateBookFields({ ...valid, seriesName: 'Série', seriesVolume: '-1' }, false, false),
    ).toMatchObject({ step: 1, field: 'book-volume' })
    expect(validateBookFields({ ...valid, quantity: 0 }, false, false)).toBeNull()
  })
})
