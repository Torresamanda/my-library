import { normalizeIsbn } from './isbn'

export function compareCoverEdition(
  isbn: string,
  resultIsbns: readonly string[],
): 'same' | 'different' | 'unknown' {
  const current = normalizeIsbn(isbn)
  const found = resultIsbns.map(normalizeIsbn).filter((value): value is string => value !== null)
  if (!current || found.length === 0) return 'unknown'
  return found.includes(current) ? 'same' : 'different'
}
