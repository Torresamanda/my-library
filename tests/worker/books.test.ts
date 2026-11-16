import { readFileSync } from 'node:fs'
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleRequest, type Environment } from '../../worker/index'
import type { Database, Statement } from '../../worker/database'
import { authenticate } from '../../worker/auth'

vi.mock('../../worker/auth', () => ({ authenticate: vi.fn().mockResolvedValue(true) }))

function createDb(): Database {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(readFileSync(new URL('../../migrations/0001_initial.sql', import.meta.url), 'utf8'))
  function prepare(sql: string): Statement {
    const statement = db.prepare(sql)
    let values: SQLInputValue[] = []
    return {
      bind(...params) {
        values = params
        return this
      },
      async first<T>() {
        return (statement.get(...values) as T | undefined) ?? null
      },
      async all<T>() {
        return { results: statement.all(...values) as T[] }
      },
      async run() {
        return { meta: { changes: Number(statement.run(...values).changes) } }
      },
    }
  }
  return {
    prepare,
    async batch(statements) {
      db.exec('BEGIN')
      try {
        const result = []
        for (const statement of statements) result.push(await statement.run())
        db.exec('COMMIT')
        return result
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
  }
}

function send(env: Environment, method: string, path: string, body?: unknown) {
  return handleRequest(
    new Request(`http://localhost${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    env,
  )
}

const example = {
  title: 'Livro',
  author: 'Autora',
  isbn: '0-306-40615-2',
  quantity: 2,
  status: 'lendo',
  seriesName: 'Série',
  seriesVolume: 1,
  genres: ['Fantasia', 'Romance'],
}
let env: Environment
beforeEach(() => {
  env = { DB: createDb() }
  vi.mocked(authenticate).mockResolvedValue(true)
})

describe('books API', () => {
  it('creates, lists, edits and deletes a book with its genres', async () => {
    const created = await send(env, 'POST', '/api/books', example)
    expect(created.status).toBe(201)
    const { book } = (await created.json()) as {
      book: { id: string; isbn: string; genres: string[] }
    }
    expect(book.isbn).toBe('9780306406157')
    expect(book.genres).toEqual(['Fantasia', 'Romance'])
    const list = await send(env, 'GET', '/api/books')
    expect(((await list.json()) as { books: unknown[] }).books).toHaveLength(1)
    const edited = await send(env, 'PUT', `/api/books/${book.id}`, {
      ...example,
      quantity: 3,
      genres: ['Mistério'],
    })
    expect(edited.status).toBe(200)
    expect(
      ((await edited.json()) as { book: { genres: string[]; quantity: number } }).book,
    ).toMatchObject({ genres: ['Mistério'], quantity: 3 })
    expect((await send(env, 'DELETE', `/api/books/${book.id}`)).status).toBe(204)
    expect((await send(env, 'GET', `/api/books/${book.id}`)).status).toBe(404)
  })
  it('rejects duplicated ISBNs and invalid data without adding books', async () => {
    expect((await send(env, 'POST', '/api/books', example)).status).toBe(201)
    expect(
      (await send(env, 'POST', '/api/books', { ...example, isbn: '9780306406157' })).status,
    ).toBe(409)
    expect(
      (await send(env, 'POST', '/api/books', { ...example, isbn: null, title: '' })).status,
    ).toBe(400)
    expect((await send(env, 'POST', '/api/books', { ...example, isbn: 'invalid' })).status).toBe(
      400,
    )
    expect(
      (
        await send(env, 'POST', '/api/books', {
          ...example,
          cover_url: 'https://example.com/image',
        })
      ).status,
    ).toBe(400)
    expect(
      ((await (await send(env, 'GET', '/api/books')).json()) as { books: unknown[] }).books,
    ).toHaveLength(1)
  })
  it('stores only approved automatic covers for books with ISBN', async () => {
    const coverUrl = 'https://covers.openlibrary.org/b/id/123-M.jpg'
    const response = await send(env, 'POST', '/api/books', { ...example, coverUrl })
    expect(response.status).toBe(201)
    const { book } = (await response.json()) as { book: { id: string; coverUrl: string } }
    expect(book.coverUrl).toBe(coverUrl)
    const edited = await send(env, 'PUT', `/api/books/${book.id}`, { ...example, quantity: 3 })
    expect(await edited.json()).toMatchObject({ book: { coverUrl } })
    expect(
      (await send(env, 'POST', '/api/books', { ...example, isbn: null, coverUrl })).status,
    ).toBe(400)
    expect(
      (
        await send(env, 'POST', '/api/books', {
          ...example,
          isbn: null,
          coverUrl: 'https://example.com/a.jpg',
        })
      ).status,
    ).toBe(400)
  })
  it('does not permit unauthorized collection access', async () => {
    vi.mocked(authenticate).mockResolvedValue(false)
    expect((await send(env, 'GET', '/api/books')).status).toBe(401)
    expect((await send(env, 'POST', '/api/books', example)).status).toBe(401)
  })
})
