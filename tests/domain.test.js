import { describe, expect, it } from 'vitest'
import { normalizeIsbn } from '../src/domain/isbn.js'
import { libraryStats } from '../src/domain/libraryStats.js'

describe('ISBN', () => {
  it('normalizes equivalent ISBN-10 and ISBN-13 editions to the same value', () => {
    expect(normalizeIsbn('0-306-40615-2')).toBe('9780306406157')
    expect(normalizeIsbn('978-0-306-40615-7')).toBe('9780306406157')
  })
  it('validates ISBN-10 with X and rejects invalid checksums and non-book EANs', () => {
    expect(normalizeIsbn('080442957X')).toBe('9780804429573')
    expect(normalizeIsbn('9780306406158')).toBeNull()
    expect(normalizeIsbn('4006381333931')).toBeNull()
    expect(normalizeIsbn('abc9780306406157')).toBeNull()
  })
})

describe('dashboard', () => {
  it('sums copies but counts status once per edition', () => {
    expect(libraryStats([{ quantity: 2, status: 'concluido' }, { quantity: 1, status: 'lendo' }, { quantity: 4, status: 'nao_lido' }, { quantity: 1, status: 'abandonado' }])).toEqual({ copies: 8, read: 1, reading: 1, abandoned: 1 })
  })
})
