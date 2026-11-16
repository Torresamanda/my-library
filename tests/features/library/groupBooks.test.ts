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

it('combines filters and keeps series volumes ordered under descending titles', () => {
  const items = [
    { ...book('Dois', 'Saga', 2, ['Fantasia']), status: 'lendo' as const },
    { ...book('Um', 'Saga', 1, ['FANTASIA']), status: 'lendo' as const },
    book('Avulso', null, null, ['Fantasia']),
    { ...book('Outro', 'Outra', 1, ['Romance']), status: 'concluido' as const },
  ]
  const result = groupBooks(items, '', {
    genre: 'fantasia',
    status: 'lendo',
    series: 'name:saga',
    order: 'title-desc',
  })
  expect(result.series).toHaveLength(1)
  expect(result.series[0]?.books.map((item) => item.title)).toEqual(['Um', 'Dois'])
  expect(result.standalone).toEqual([])
  expect(
    groupBooks(items, '', {
      genre: '',
      status: '',
      series: 'none',
      order: 'title-asc',
    }).standalone.map((item) => item.title),
  ).toEqual(['Avulso'])
  expect(
    groupBooks(items, '', { genre: 'inexistente', status: '', series: '', order: 'title-asc' }),
  ).toEqual({ series: [], standalone: [] })
})

it('sorts standalone titles in the chosen order and hides empty series', () => {
  const items = [book('Alfa', null, null), book('Zulu', null, null), book('Volume', 'Saga', 1)]
  const filters = { genre: '', status: '', series: 'none', order: 'title-desc' as const }
  const result = groupBooks(items, '', filters)
  expect(result.standalone.map((item) => item.title)).toEqual(['Zulu', 'Alfa'])
  expect(result.series).toEqual([])
  expect(groupBooks(items, 'não encontrado').series).toEqual([])
})
