export function libraryStats(books) {
  return books.reduce((stats, book) => {
    if (Number.isSafeInteger(book.quantity) && book.quantity > 0) stats.copies += book.quantity
    if (book.status === 'concluido') stats.read += 1
    if (book.status === 'lendo') stats.reading += 1
    if (book.status === 'abandonado') stats.abandoned += 1
    return stats
  }, { copies: 0, read: 0, reading: 0, abandoned: 0 })
}
