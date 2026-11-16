import { describe, expect, it } from 'vitest'
import { isLibraryPath } from '../../../src/features/navigation/path'

describe('library page paths', () => {
  it('recognizes the home page', () => {
    expect(isLibraryPath('/')).toBe(true)
  })

  it('shows the not found page for unknown paths', () => {
    expect(isLibraryPath('/livro-inexistente')).toBe(false)
    expect(isLibraryPath('/estante/livro')).toBe(false)
  })
})
