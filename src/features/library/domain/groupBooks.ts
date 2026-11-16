import type { LibraryBook } from '../services/books'

export interface SeriesGroup {
  name: string
  books: LibraryBook[]
}

export function groupBooks(
  books: readonly LibraryBook[],
  search: string,
): { series: SeriesGroup[]; standalone: LibraryBook[] } {
  const needle = search.trim().toLocaleLowerCase('pt-BR')
  const matching = books.filter((book) =>
    [book.title, book.author, book.seriesName ?? '', ...book.genres].some((value) =>
      value.toLocaleLowerCase('pt-BR').includes(needle),
    ),
  )
  const groups = new Map<string, SeriesGroup>()
  const standalone: LibraryBook[] = []
  for (const book of matching) {
    if (!book.seriesName) {
      standalone.push(book)
      continue
    }
    const key = book.seriesName.toLocaleLowerCase('pt-BR')
    const group = groups.get(key) ?? { name: book.seriesName, books: [] }
    group.books.push(book)
    groups.set(key, group)
  }
  const series = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  for (const group of series)
    group.books.sort(
      (a, b) =>
        (a.seriesVolume ?? Infinity) - (b.seriesVolume ?? Infinity) ||
        a.title.localeCompare(b.title, 'pt-BR'),
    )
  standalone.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  return { series, standalone }
}
