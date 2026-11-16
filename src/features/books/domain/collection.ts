import { z } from 'zod'

export const mediaTypeSchema = z.enum(['livro', 'quadrinho', 'manga', 'outro'])

export const ownershipSchema = z
  .array(z.enum(['fisico', 'ebook', 'emprestado_pessoa', 'emprestado_assinatura', 'nao_tenho']))
  .max(5)
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

const unowned = new Set<Ownership[number]>([
  'nao_tenho',
  'emprestado_pessoa',
  'emprestado_assinatura',
])
export function hasUnowned(ownership: Ownership): boolean {
  return ownership.some((value) => unowned.has(value))
}

export function setUnowned(ownership: Ownership, checked: boolean): Ownership {
  if (!checked) return ownership.filter((value) => !unowned.has(value))
  return hasUnowned(ownership) ? [...ownership] : [...ownership, 'nao_tenho']
}

export function ownershipDescription(ownership: Ownership): string {
  const labels: string[] = []
  if (ownership.includes('fisico')) labels.push('Tenho físico')
  if (ownership.includes('ebook')) labels.push('Tenho e-book')
  if (hasUnowned(ownership)) labels.push('Não tenho')
  return labels.join(', ')
}
