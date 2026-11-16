import { z } from 'zod'

const strong = z.object({ type: z.literal('bold') }).strict()
const inline = z.union([
  z
    .object({
      type: z.literal('text'),
      text: z.string().min(1).max(2000),
      marks: z.array(strong).max(1).optional(),
    })
    .strict(),
  z.object({ type: z.literal('hardBreak') }).strict(),
])
const block = z.union([
  z.object({ type: z.literal('paragraph'), content: z.array(inline).max(501).optional() }).strict(),
  z
    .object({
      type: z.literal('heading'),
      attrs: z.object({ level: z.union([z.literal(1), z.literal(2), z.literal(3)]) }).strict(),
      content: z.array(inline).max(501).optional(),
    })
    .strict(),
])
export const reviewDraftSchema = z
  .object({ type: z.literal('doc'), content: z.array(block).min(1).max(501) })
  .strict()

export type Review = z.infer<typeof reviewDraftSchema>

export const reviewSchema = reviewDraftSchema.refine((review) => reviewLength(review) <= 500)

export function reviewLength(review: Review): number {
  const text = review.content
    .map((block) =>
      (block.content ?? []).map((part) => (part.type === 'hardBreak' ? '\n' : part.text)).join(''),
    )
    .join('\n')
  return Array.from(text).length
}

export function parseStoredReview(value: string | null): Review | null {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    const result = reviewSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
