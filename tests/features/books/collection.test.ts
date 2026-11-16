import { describe, expect, it } from 'vitest'
import {
  hasUnowned,
  ownershipDescription,
  ownershipSchema,
  setUnowned,
} from '../../../src/features/books/domain/collection'

describe('collection ownership', () => {
  it('represents reading without ownership with one option', () => {
    expect(setUnowned(['fisico'], true)).toEqual(['fisico', 'nao_tenho'])
    expect(ownershipDescription(['fisico', 'nao_tenho'])).toBe('Tenho físico, Não tenho')
    expect(ownershipSchema.safeParse(['fisico', 'ebook', 'nao_tenho']).success).toBe(true)
  })
  it('preserves legacy borrowed sources until the user clears the option', () => {
    const legacy = ['emprestado_pessoa', 'emprestado_assinatura'] as const
    expect(hasUnowned([...legacy])).toBe(true)
    expect(setUnowned([...legacy], true)).toEqual([...legacy])
    expect(ownershipDescription([...legacy])).toBe('Não tenho')
    expect(setUnowned(['ebook', ...legacy], false)).toEqual(['ebook'])
  })
})
