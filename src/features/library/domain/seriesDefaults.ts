import type { LibraryBook } from '../services/books'

export type SeriesDefaults = { seriesName: string; publisher: string; genres: string[] }

export function seriesDefaults(books: readonly LibraryBook[], seriesName: string): SeriesDefaults {
  const normalize = (value: string) => value.trim().toLocaleLowerCase('pt-BR')
  const members = books.filter(
    (book) => book.seriesName && normalize(book.seriesName) === normalize(seriesName),
  )
  if (!members.length) return { seriesName, publisher: '', genres: [] }
  const publisher = members[0]?.publisher?.trim() ?? ''
  const commonPublisher =
    publisher && members.every((book) => normalize(book.publisher ?? '') === normalize(publisher))
      ? publisher
      : ''
  const unique = new Map<string, string>()
  for (const value of members[0]?.genres ?? []) {
    const genre = value.trim()
    if (genre && !unique.has(normalize(genre))) unique.set(normalize(genre), genre)
  }
  const genres = [...unique.entries()]
    .filter(([key]) =>
      members.every((book) => book.genres.some((genre) => normalize(genre) === key)),
    )
    .map(([, value]) => value)
    .slice(0, 4)
  return { seriesName, publisher: commonPublisher, genres }
}
