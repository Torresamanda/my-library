import { describe, expect, it } from 'vitest'
import { compareCoverEdition } from '../../../src/features/books/domain/coverEdition'

describe('cover edition comparison', () => {
  it('recognizes equivalent ISBN-10 and ISBN-13 editions', () => {
    expect(compareCoverEdition('0-306-40615-2', ['9780306406157'])).toBe('same')
  })
  it('distinguishes a different edition from missing or invalid identifiers', () => {
    expect(compareCoverEdition('9780306406157', ['080442957X'])).toBe('different')
    expect(compareCoverEdition('', ['9780306406157'])).toBe('unknown')
    expect(compareCoverEdition('9780306406157', ['invalid'])).toBe('unknown')
  })
})
