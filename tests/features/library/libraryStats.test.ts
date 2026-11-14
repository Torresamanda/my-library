import { describe, expect, it } from 'vitest'
import { libraryStats } from '../../../src/features/library/domain/libraryStats'

describe('dashboard', () => {
  it('sums copies but counts status once per edition', () => {
    expect(
      libraryStats([
        { quantity: 2, status: 'concluido' },
        { quantity: 1, status: 'lendo' },
        { quantity: 4, status: 'nao_lido' },
        { quantity: 1, status: 'abandonado' },
      ]),
    ).toEqual({ copies: 8, read: 1, reading: 1, abandoned: 1 })
  })
})
