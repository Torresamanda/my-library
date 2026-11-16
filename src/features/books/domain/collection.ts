import { z } from 'zod'

export const mediaTypeSchema = z.enum(['livro', 'quadrinho', 'manga', 'outro'])

export const ownershipSchema = z
  .array(z.enum(['fisico', 'ebook', 'emprestado_pessoa', 'emprestado_assinatura']))
  .max(4)
  .refine((values) => new Set(values).size === values.length)

export type MediaType = z.infer<typeof mediaTypeSchema>

export type Ownership = z.infer<typeof ownershipSchema>

export function parseOwnership(value: string): Ownership {
  try {
    const parsed: unknown = JSON.parse(value)
    const result = ownershipSchema.safeParse(parsed)
    return result.success ? result.data : []
  } catch {
    return []
  }
}
