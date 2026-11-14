import type { Database, Statement } from '../database'
import type { BookInput } from './validation'

type Input = BookInput & { isbn: string | null }

export interface BookRow {
  id: string
  title: string
  author: string
  isbn: string | null
  quantity: number
  status: string
  seriesName: string | null
  seriesVolume: number | null
  rating: number | null
  createdAt: string
  updatedAt: string
}

const selectBook = `SELECT id, title, author, isbn, quantity, status, series_name AS seriesName,
  series_volume AS seriesVolume, rating, created_at AS createdAt, updated_at AS updatedAt FROM books`

async function genresFor(db: Database, id: string): Promise<string[]> {
  const result = await db
    .prepare(
      `SELECT g.name FROM genres g JOIN book_genres bg ON bg.genre_id = g.id
    WHERE bg.book_id = ? ORDER BY g.name COLLATE NOCASE`,
    )
    .bind(id)
    .all<{ name: string }>()
  return result.results.map((row) => row.name)
}

export async function getBook(db: Database, id: string) {
  const book = await db.prepare(`${selectBook} WHERE id = ?`).bind(id).first<BookRow>()
  return book ? { ...book, genres: await genresFor(db, id) } : null
}

export async function listBooks(db: Database) {
  const result = await db.prepare(`${selectBook} ORDER BY title COLLATE NOCASE, id`).all<BookRow>()
  const genres = await db
    .prepare(
      `SELECT bg.book_id AS bookId, g.name FROM book_genres bg
    JOIN genres g ON g.id = bg.genre_id ORDER BY g.name COLLATE NOCASE`,
    )
    .all<{ bookId: string; name: string }>()
  const grouped = new Map<string, string[]>()
  for (const genre of genres.results) {
    const names = grouped.get(genre.bookId) ?? []
    names.push(genre.name)
    grouped.set(genre.bookId, names)
  }
  return result.results.map((book) => ({ ...book, genres: grouped.get(book.id) ?? [] }))
}

export async function isbnExists(db: Database, isbn: string, id: string): Promise<boolean> {
  return !!(await db
    .prepare('SELECT id FROM books WHERE isbn = ? AND id != ?')
    .bind(isbn, id)
    .first())
}

function genreStatements(db: Database, id: string, genres: string[]): Statement[] {
  const statements = [db.prepare('DELETE FROM book_genres WHERE book_id = ?').bind(id)]
  for (const genre of genres) {
    statements.push(
      db
        .prepare('INSERT INTO genres (id, name) VALUES (?, ?) ON CONFLICT(name) DO NOTHING')
        .bind(crypto.randomUUID(), genre),
    )
    statements.push(
      db
        .prepare(
          'INSERT INTO book_genres (book_id, genre_id) SELECT ?, id FROM genres WHERE name = ? COLLATE NOCASE',
        )
        .bind(id, genre),
    )
  }
  return statements
}

export async function saveBook(
  db: Database,
  id: string,
  book: Input,
  existing: boolean,
): Promise<void> {
  const values = [
    book.title,
    book.author,
    book.isbn,
    book.quantity,
    book.status,
    book.seriesName,
    book.seriesVolume,
  ]
  const statement = existing
    ? db
        .prepare(
          `UPDATE books SET title = ?, author = ?, isbn = ?, quantity = ?, status = ?, series_name = ?, series_volume = ?, updated_at = datetime('now') WHERE id = ?`,
        )
        .bind(...values, id)
    : db
        .prepare(
          `INSERT INTO books (title, author, isbn, quantity, status, series_name, series_volume, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(...values, id)
  await db.batch([statement, ...genreStatements(db, id, book.genres)])
}

export async function deleteBook(db: Database, id: string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM books WHERE id = ?').bind(id).run()
  return result.meta.changes > 0
}
