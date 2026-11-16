import { hasOwned, type Ownership } from '../../books/domain/collection'

export type ReadingStatus = 'nao_lido' | 'lendo' | 'concluido' | 'abandonado'

export interface BookSummary {
  quantity: number
  status: ReadingStatus
  pageCount?: number | null
  ownership?: Ownership
}

export interface LibraryStats {
  copies: number
  read: number
  reading: number
  abandoned: number
  pagesRead: number
}

export function libraryStats(books: readonly BookSummary[]): LibraryStats {
  return books.reduce(
    (stats, book) => {
      if (hasOwned(book.ownership)) stats.copies += 1
      if (book.status === 'concluido') {
        stats.read += 1
        if (
          typeof book.pageCount === 'number' &&
          Number.isSafeInteger(book.pageCount) &&
          book.pageCount > 0
        )
          stats.pagesRead += book.pageCount
      }
      if (book.status === 'lendo') stats.reading += 1
      if (book.status === 'abandonado') stats.abandoned += 1
      return stats
    },
    { copies: 0, read: 0, reading: 0, abandoned: 0, pagesRead: 0 },
  )
}
