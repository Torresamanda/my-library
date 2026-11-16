import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { describe, expect, it } from 'vitest'

const schema = readFileSync(new URL('../../migrations/0001_initial.sql', import.meta.url), 'utf8')
function database() {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(schema)
  return db
}
describe('database migration', () => {
  it('applies the schema and rejects duplicate ISBN and invalid edition data', () => {
    const db = database()
    const insert = db.prepare(
      'INSERT INTO books(id, title, author, isbn, quantity, status, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    insert.run('1', 'Livro', 'Autora', '9780306406157', 2, 'lendo', 5)
    expect(() => insert.run('2', 'Outro', 'Autora', '9780306406157', 1, 'lendo', null)).toThrow()
    expect(() => insert.run('3', '', 'Autora', null, 1, 'lendo', null)).toThrow()
    expect(() => insert.run('4', 'Livro', 'Autora', null, 1.5, 'lendo', null)).toThrow()
    expect(() => insert.run('5', 'Livro', 'Autora', null, 1, 'lendo', 3.5)).toThrow()
    expect(() => insert.run('6', 'Livro', 'Autora', null, 1, 'outro', null)).toThrow()
    db.close()
  })
  it('removes book-to-genre links when a book is deleted', () => {
    const db = database()
    db.exec(
      "INSERT INTO books (id, title, author) VALUES ('1', 'Livro', 'Autora'); INSERT INTO genres (id, name) VALUES ('g', 'Romance'); INSERT INTO book_genres VALUES ('1', 'g'); DELETE FROM books WHERE id = '1';",
    )
    expect(db.prepare('SELECT count(*) AS count FROM book_genres').get()?.count).toBe(0)
    db.close()
  })
})

it('adds optional metadata without changing existing books or genres', () => {
  const db = database()
  db.exec(
    "INSERT INTO books (id, title, author) VALUES ('1', 'Livro', 'Autora'); INSERT INTO genres (id, name) VALUES ('g', 'Romance'); INSERT INTO book_genres VALUES ('1', 'g');",
  )
  db.exec(readFileSync(new URL('../../migrations/0002_book_metadata.sql', import.meta.url), 'utf8'))
  expect(
    db.prepare('SELECT title, publisher, page_count FROM books WHERE id = ?').get('1'),
  ).toMatchObject({ title: 'Livro', publisher: null, page_count: null })
  expect(db.prepare('SELECT count(*) AS count FROM book_genres').get()).toMatchObject({ count: 1 })
  expect(() => db.prepare('UPDATE books SET page_count = ? WHERE id = ?').run(0, '1')).toThrow()
  db.close()
})

it('keeps existing editions and initializes the new fields without assumptions', () => {
  const db = database()
  db.exec("INSERT INTO books (id, title, author, quantity) VALUES ('1', 'Livro', 'Autora', 2)")
  db.exec(readFileSync(new URL('../../migrations/0002_book_metadata.sql', import.meta.url), 'utf8'))
  db.exec(
    readFileSync(new URL('../../migrations/0003_collection_fields.sql', import.meta.url), 'utf8'),
  )
  expect(
    db
      .prepare('SELECT favorite, media_type, ownership_json, quantity FROM books WHERE id = ?')
      .get('1'),
  ).toMatchObject({ favorite: 0, media_type: null, ownership_json: '[]', quantity: 2 })
  expect(() => db.prepare('UPDATE books SET favorite = 2 WHERE id = ?').run('1')).toThrow()
  expect(() => db.prepare('UPDATE books SET media_type = ? WHERE id = ?').run('x', '1')).toThrow()
  db.close()
})
