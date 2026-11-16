import { z } from 'zod'
import { normalizeIsbn } from '../../src/features/books/domain/isbn'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => v || null)

const bookSchema = z
  .object({
    title: z.string().trim().min(1).max(250),
    author: z.string().trim().min(1).max(250),
    isbn: z.string().trim().max(32).nullable().optional(),
    coverUrl: z
      .string()
      .regex(/^https:\/\/covers\.openlibrary\.org\/b\/id\/[1-9][0-9]{0,15}-M\.jpg$/)
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    publisher: optionalText(250),
    pageCount: z
      .number()
      .int()
      .min(1)
      .max(1000000)
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    quantity: z.number().int().min(1).max(10000),
    status: z.enum(['nao_lido', 'lendo', 'concluido', 'abandonado']),
    seriesName: optionalText(200),
    seriesVolume: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    genres: z.array(z.string().trim().min(1).max(80)).max(4).default([]),
  })
  .strict()
  .superRefine((book, ctx) => {
    if (book.coverUrl && !book.isbn)
      ctx.addIssue({ code: 'custom', message: 'Capa automática exige ISBN', path: ['coverUrl'] })
    if (book.isbn && !normalizeIsbn(book.isbn))
      ctx.addIssue({ code: 'custom', message: 'ISBN inválido', path: ['isbn'] })
    if (book.seriesVolume !== null && !book.seriesName)
      ctx.addIssue({ code: 'custom', message: 'Informe o nome da série', path: ['seriesName'] })
    if (new Set(book.genres.map((g) => g.toLowerCase())).size !== book.genres.length)
      ctx.addIssue({ code: 'custom', message: 'Gênero duplicado', path: ['genres'] })
  })

export type BookInput = z.output<typeof bookSchema>

export function validateBook(value: unknown) {
  const result = bookSchema.safeParse(value)
  if (!result.success) return null
  return { ...result.data, isbn: result.data.isbn ? normalizeIsbn(result.data.isbn) : null }
}
