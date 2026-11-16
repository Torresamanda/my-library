import { describe, expect, it } from 'vitest'
import { libraryStats } from '../../../src/features/library/domain/libraryStats'

describe('dashboard', () => {
  it('sums copies but counts status once per edition', () => {
    expect(
      libraryStats([
        { quantity: 2, status: 'concluido', pageCount: 250 },
        { quantity: 1, status: 'lendo', pageCount: 500 },
        { quantity: 4, status: 'nao_lido' },
        { quantity: 1, status: 'abandonado' },
      ]),
    ).toEqual({ copies: 8, read: 1, reading: 1, abandoned: 1, pagesRead: 250 })
  })
})

it('ignores missing and invalid page counts and includes concluded editions only once', () => {
  expect(
    libraryStats([
      { quantity: 3, status: 'concluido', pageCount: 100 },
      { quantity: 1, status: 'concluido', pageCount: null },
      { quantity: 1, status: 'concluido', pageCount: -1 },
      { quantity: 1, status: 'concluido', pageCount: 2.5 },
      { quantity: 1, status: 'abandonado', pageCount: 200 },
    ]).pagesRead,
  ).toBe(100)
})
