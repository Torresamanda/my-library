import { describe, expect, it } from 'vitest'
import {
  parseStoredReview,
  reviewLength,
  reviewSchema,
} from '../../../src/features/books/domain/review'

describe('rich personal comment', () => {
  it('counts Unicode code points and line breaks without counting formatting', () => {
    const review = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '😀', marks: [{ type: 'bold' }] }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'a' },
            { type: 'hardBreak' },
            { type: 'text', text: '👩‍💻' },
          ],
        },
      ],
    }
    const parsed = reviewSchema.parse(review)
    expect(reviewLength(parsed)).toBe(7)
    expect(parseStoredReview(JSON.stringify(review))).toEqual(review)
  })
  it('enforces 500 visible code points including line breaks', () => {
    const doc = (length: number) => ({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '😀'.repeat(length) }] }],
    })
    expect(reviewSchema.safeParse(doc(500)).success).toBe(true)
    expect(reviewSchema.safeParse(doc(501)).success).toBe(false)
  })
  it('rejects unsupported nodes, links, attributes and invalid stored data', () => {
    const doc = (node: object) => ({
      type: 'doc',
      content: [{ type: 'paragraph', content: [node] }],
    })
    expect(
      reviewSchema.safeParse(
        doc({
          type: 'text',
          text: 'x',
          marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
        }),
      ).success,
    ).toBe(false)
    expect(
      reviewSchema.safeParse(doc({ type: 'image', attrs: { src: 'x', onerror: 'alert(1)' } }))
        .success,
    ).toBe(false)
    expect(
      reviewSchema.safeParse(doc({ type: 'text', text: 'x', attrs: { onclick: 'alert(1)' } }))
        .success,
    ).toBe(false)
    expect(parseStoredReview('{bad')).toBeNull()
  })
})
