/** Normalizes an ISBN to its ISBN-13 equivalent. Returns null for invalid input. */
export function normalizeIsbn(value: unknown): string | null {
  if (typeof value !== 'string' || !/^[0-9xX\s-]+$/.test(value)) return null
  const isbn = value.replace(/[\s-]/g, '').toUpperCase()

  if (/^\d{9}[\dX]$/.test(isbn)) {
    const sum = [...isbn].reduce(
      (total, char, index) => total + (char === 'X' ? 10 : Number(char)) * (10 - index),
      0,
    )
    if (sum % 11 !== 0) return null
    return appendCheckDigit(`978${isbn.slice(0, 9)}`)
  }

  if (!/^97[89]\d{10}$/.test(isbn)) return null

  return appendCheckDigit(isbn.slice(0, 12)) === isbn ? isbn : null
}

function appendCheckDigit(firstTwelve: string): string {
  const sum = [...firstTwelve].reduce(
    (total, char, index) => total + Number(char) * (index % 2 ? 3 : 1),
    0,
  )

  return firstTwelve + ((10 - (sum % 10)) % 10)
}
