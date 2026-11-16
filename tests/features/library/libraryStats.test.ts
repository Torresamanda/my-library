import { describe, expect, it } from 'vitest'
import { libraryStats } from '../../../src/features/library/domain/libraryStats'

describe('dashboard', () => {
  it('sums copies but counts status once per edition', () => {
    expect(
      libraryStats([
        { quantity: 2, status: 'concluido', pageCount: 250, ownership: ['fisico'] },
        { quantity: 1, status: 'lendo', pageCount: 500, ownership: ['ebook'] },
        { quantity: 4, status: 'nao_lido', ownership: ['fisico'] },
        { quantity: 1, status: 'abandonado', ownership: ['ebook'] },
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

it('counts only owned copies, independently of reading status', () => {
  const stats = libraryStats([
    { quantity: 2, status: 'concluido', pageCount: 200, ownership: ['fisico', 'ebook'] },
    { quantity: 1, status: 'concluido', pageCount: 100, ownership: ['nao_tenho'] },
    { quantity: 3, status: 'lendo', ownership: ['emprestado_assinatura'] },
    { quantity: 4, status: 'nao_lido', ownership: [] },
    { quantity: 5, status: 'abandonado' },
    { quantity: 1, status: 'lendo', ownership: ['ebook', 'nao_tenho'] },
  ])
  expect(stats).toEqual({ copies: 3, read: 2, reading: 2, abandoned: 1, pagesRead: 300 })
})
