import { describe, expect, it } from 'vitest'
import { groupBooks } from '../../../src/features/library/domain/groupBooks'
import type { LibraryBook } from '../../../src/features/library/services/books'

function book(
  title: string,
  seriesName: string | null,
  seriesVolume: number | null,
  genres: string[] = [],
): LibraryBook {
  return {
    id: title,
    title,
    author: 'Autora',
    quantity: 1,
    status: 'nao_lido',
    seriesName,
    seriesVolume,
    genres,
  }
}

describe('library grouping', () => {
  const books = [
    book('Segundo', 'Saga', 2),
    book('Primeiro', 'Saga', 1, ['Fantasia']),
    book('Avulso', null, null),
  ]
  it('groups and orders volumes, leaving standalone books separate', () => {
    const result = groupBooks(books, '')
    expect(result.series[0]?.books.map((item) => item.title)).toEqual(['Primeiro', 'Segundo'])
    expect(result.standalone.map((item) => item.title)).toEqual(['Avulso'])
  })
  it('filters by genre and series without changing the original array', () => {
    expect(groupBooks(books, 'fantasia').series[0]?.books.map((item) => item.title)).toEqual([
      'Primeiro',
    ])
    expect(groupBooks(books, 'saga').series[0]?.books).toHaveLength(2)
    expect(books.map((item) => item.title)).toEqual(['Segundo', 'Primeiro', 'Avulso'])
  })
})
