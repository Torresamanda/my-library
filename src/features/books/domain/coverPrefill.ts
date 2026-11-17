import type { CoverSearchResult } from '../../library/services/books'
import { compareCoverEdition } from './coverEdition'

type BookFields = {
  title: string
  author: string
  publisher: string
  pageCount: string
  genres: string
  isbn: string
}

export function prefillFromCover(current: BookFields, result: CoverSearchResult): BookFields {
  if (current.isbn.trim() && compareCoverEdition(current.isbn, result.isbns) !== 'same')
    return { ...current }
  return {
    ...current,
    title: current.title.trim() ? current.title : result.title,
    author: current.author.trim() ? current.author : result.authors.join(', ').slice(0, 250),
    publisher: current.publisher.trim() ? current.publisher : result.publisher,
    pageCount: current.pageCount.trim() ? current.pageCount : (result.pageCount?.toString() ?? ''),
    genres: current.genres.trim() ? current.genres : result.genres.join(', '),
  }
}
