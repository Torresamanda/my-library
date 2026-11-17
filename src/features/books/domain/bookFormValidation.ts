import { normalizeIsbn } from './isbn'

export type BookFormStep = 0 | 1 | 2

export type FormIssue = {
  step: BookFormStep
  field: string
  message: string
  expandEdition?: boolean
}
type ValidationFields = {
  title: string
  author: string
  isbn: string
  genres: string
  seriesName: string
  seriesVolume: string
  pageCount: string
  quantity: number
}

export function validateBookFields(
  form: ValidationFields,
  ownsCopies: boolean,
  invalidReview: boolean,
  mainOnly = false,
): FormIssue | null {
  if (!form.title.trim())
    return { step: 0, field: 'book-title', message: 'Informe o título do livro.' }
  if (!form.author.trim())
    return { step: 0, field: 'book-author', message: 'Informe o autor do livro.' }
  if (form.isbn.trim() && !normalizeIsbn(form.isbn))
    return {
      step: 0,
      field: 'book-isbn',
      message:
        'Confira o ISBN: informe um número válido de 10 ou 13 dígitos, ou deixe o campo vazio.',
    }
  if (mainOnly) return null
  const genres = form.genres
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean)
  if (
    genres.length > 4 ||
    genres.some((genre) => genre.length > 80) ||
    new Set(genres.map((genre) => genre.toLocaleLowerCase('pt-BR'))).size !== genres.length
  )
    return {
      step: 1,
      field: 'book-genres',
      message:
        'Use até 4 gêneros diferentes, separados por vírgula. Cada gênero pode ter até 80 caracteres.',
    }
  if (form.seriesVolume && !form.seriesName.trim())
    return {
      step: 1,
      field: 'book-series',
      expandEdition: true,
      message: 'Para informar o volume, preencha também o nome da série.',
    }
  const pages = form.pageCount ? Number(form.pageCount) : null
  if (pages !== null && (!Number.isInteger(pages) || pages < 1 || pages > 1000000))
    return {
      step: 1,
      field: 'book-pages',
      expandEdition: true,
      message: 'O número de páginas deve ser um inteiro entre 1 e 1000000.',
    }
  const volume = form.seriesVolume ? Number(form.seriesVolume) : null
  if (volume !== null && (!Number.isInteger(volume) || volume < 1 || volume > 10000))
    return {
      step: 1,
      field: 'book-volume',
      expandEdition: true,
      message: 'O volume deve ser um número inteiro entre 1 e 10000.',
    }
  if (
    ownsCopies &&
    (!Number.isInteger(form.quantity) || form.quantity < 1 || form.quantity > 10000)
  )
    return {
      step: 1,
      field: 'book-quantity',
      message: 'A quantidade deve ser um número inteiro entre 1 e 10000.',
    }
  if (invalidReview)
    return {
      step: 2,
      field: 'review-editor',
      message:
        'O comentário deve ter no máximo 500 caracteres e usar apenas as formatações permitidas.',
    }
  return null
}
