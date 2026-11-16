import type { LibraryBook } from '../services/books'

export interface LibraryFilters {
  genre: string
  status: string
  series: string
  order: 'title-asc' | 'title-desc'
}

export const defaultFilters = (): LibraryFilters => ({
  genre: '',
  status: '',
  series: '',
  order: 'title-asc',
})

export interface SeriesGroup {
  name: string
  books: LibraryBook[]
}

export function groupBooks(
  books: readonly LibraryBook[],
  search: string,
  filters: LibraryFilters = defaultFilters(),
): { series: SeriesGroup[]; standalone: LibraryBook[] } {
  const needle = search.trim().toLocaleLowerCase('pt-BR')
  const normalize = (text: string) => text.toLocaleLowerCase('pt-BR')
  const matching = books.filter(
    (book) =>
      [book.title, book.author, book.seriesName ?? '', ...book.genres].some((value) =>
        normalize(value).includes(needle),
      ) &&
      (!filters.genre ||
        book.genres.some((genre) => normalize(genre) === normalize(filters.genre))) &&
      (!filters.status || book.status === filters.status) &&
      (!filters.series ||
        (filters.series === 'none'
          ? !book.seriesName
          : normalize(book.seriesName ?? '') === normalize(filters.series.slice(5)))),
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
  const direction = filters.order === 'title-desc' ? -1 : 1
  const series = [...groups.values()].sort(
    (a, b) => direction * a.name.localeCompare(b.name, 'pt-BR'),
  )
  for (const group of series)
    group.books.sort(
      (a, b) =>
        (a.seriesVolume ?? Infinity) - (b.seriesVolume ?? Infinity) ||
        a.title.localeCompare(b.title, 'pt-BR'),
    )
  standalone.sort((a, b) => direction * a.title.localeCompare(b.title, 'pt-BR'))
  return { series, standalone }
}
