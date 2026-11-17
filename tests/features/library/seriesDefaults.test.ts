import { describe, expect, it } from 'vitest'
import { seriesDefaults } from '../../../src/features/library/domain/seriesDefaults'
import type { LibraryBook } from '../../../src/features/library/services/books'

function book(seriesName: string, publisher: string | null, genres: string[]): LibraryBook {
  return {
    id: 'id',
    title: 'Livro',
    author: 'Autora',
    quantity: 1,
    status: 'nao_lido',
    seriesName,
    seriesVolume: 1,
    publisher,
    genres,
  }
}
describe('series defaults', () => {
  it('copies only publisher and genres common to every edition in the series', () => {
    const books = [
      book('Série A', 'Editora', ['Fantasia', 'Romance']),
      book('série a', ' editora ', ['fantasia', 'Aventura']),
      book('Outra', 'Diferente', []),
    ]
    expect(seriesDefaults(books, 'Série A')).toEqual({
      seriesName: 'Série A',
      publisher: 'Editora',
      genres: ['Fantasia'],
    })
  })
  it('does not infer a publisher when it differs or is missing', () => {
    expect(
      seriesDefaults([book('Saga', 'Uma', ['Drama']), book('Saga', 'Outra', ['Drama'])], 'Saga')
        .publisher,
    ).toBe('')
    expect(
      seriesDefaults([book('Saga', 'Uma', ['Drama']), book('Saga', null, [])], 'Saga'),
    ).toEqual({ seriesName: 'Saga', publisher: '', genres: [] })
  })
  it('handles a single edition, deduplicates and limits genres, and handles an empty series', () => {
    const items = [book('Saga', 'Editora', ['A', 'a', 'B', 'C', 'D', 'E'])]
    expect(seriesDefaults(items, 'Saga')).toEqual({
      seriesName: 'Saga',
      publisher: 'Editora',
      genres: ['A', 'B', 'C', 'D'],
    })
    expect(seriesDefaults(items, 'Outra')).toEqual({
      seriesName: 'Outra',
      publisher: '',
      genres: [],
    })
  })
})
