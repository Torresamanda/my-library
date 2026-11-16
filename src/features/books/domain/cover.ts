/** Restrict remote artwork to URLs from explicitly supported book services. */
export function googleCoverId(value: string): string | null {
  if (value.length > 1000) return null
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' ||
      !['books.google.com', 'books.google.com.br'].includes(url.hostname) ||
      url.port ||
      url.username ||
      url.password ||
      url.hash ||
      url.pathname !== '/books/content'
    )
      return null
    const id = url.searchParams.get('id')
    if (!id || !/^[A-Za-z0-9_-]{1,100}$/.test(id)) return null
    const allowed = new Set(['id', 'printsec', 'img', 'zoom', 'edge', 'source'])
    for (const [key, part] of url.searchParams)
      if (
        !allowed.has(key) ||
        !/^[A-Za-z0-9_-]{1,100}$/.test(part) ||
        url.searchParams.getAll(key).length !== 1
      )
        return null
    return id
  } catch {
    return null
  }
}

export function isOpenLibraryCover(value: string): boolean {
  return /^https:\/\/covers\.openlibrary\.org\/b\/id\/[1-9][0-9]{0,15}-M\.jpg$/.test(value)
}

export function validCoverUrl(value: string): boolean {
  return isOpenLibraryCover(value) || googleCoverId(value) !== null
}
