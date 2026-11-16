import { authenticate, type AuthEnvironment } from './auth'
import { proxyFirebaseAuth } from './authentication/proxy'
import type { Database } from './database'
import { deleteBook, getBook, isbnExists, listBooks, saveBook } from './books/repository'
import { validateBook } from './books/validation'

export interface Environment extends AuthEnvironment {
  DB: Database
}

function json(body: object, status: number): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}

async function health(env: Environment): Promise<Response> {
  try {
    const result = await env.DB.prepare('SELECT COUNT(*) AS total FROM books').first<{
      total: number
    }>()
    if (!result || typeof result.total !== 'number') throw new Error('Database unavailable')
    return json({ status: 'ok' }, 200)
  } catch {
    return json({ error: 'Serviço temporariamente indisponível' }, 503)
  }
}

async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
    throw new Error('invalid')
  const reader = request.body?.getReader()
  if (!reader) throw new Error('invalid')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > 32768) {
      await reader.cancel()
      throw new Error('invalid')
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown
}

async function books(request: Request, db: Database, id: string | null): Promise<Response> {
  try {
    if (request.method === 'GET') {
      if (!id) return json({ books: await listBooks(db) }, 200)
      const book = await getBook(db, id)
      return book ? json({ book }, 200) : json({ error: 'Livro não encontrado' }, 404)
    }
    if (request.method === 'DELETE' && id)
      return (await deleteBook(db, id))
        ? new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
        : json({ error: 'Livro não encontrado' }, 404)
    if ((request.method !== 'POST' || id) && (request.method !== 'PUT' || !id))
      return json({ error: 'Método não permitido' }, 405)
    let raw: unknown
    try {
      raw = await readJson(request)
    } catch {
      return json({ error: 'Dados inválidos' }, 400)
    }
    const book = validateBook(raw)
    if (!book) return json({ error: 'Confira os dados do livro' }, 400)
    if (id && !(await getBook(db, id))) return json({ error: 'Livro não encontrado' }, 404)
    const bookId = id ?? crypto.randomUUID()
    if (book.isbn && (await isbnExists(db, book.isbn, bookId)))
      return json({ error: 'Este livro já está na biblioteca' }, 409)
    await saveBook(db, bookId, book, !!id)
    return json({ book: await getBook(db, bookId) }, id ? 200 : 201)
  } catch (error) {
    if (String(error).includes('UNIQUE constraint failed: books.isbn'))
      return json({ error: 'Este livro já está na biblioteca' }, 409)
    return json({ error: 'Serviço temporariamente indisponível' }, 503)
  }
}

/** All API routes require authorization except the data-free health check. */
export async function handleRequest(request: Request, env: Environment): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname.startsWith('/__/auth/')) return proxyFirebaseAuth(request, env.FIREBASE_PROJECT_ID)
  if (pathname === '/api/health')
    return request.method === 'GET' ? health(env) : json({ error: 'Método não permitido' }, 405)
  if (!pathname.startsWith('/api/')) return json({ error: 'Não encontrado' }, 404)
  if (!(await authenticate(request, env))) return json({ error: 'Acesso não autorizado' }, 401)
  if (pathname === '/api/session')
    return request.method === 'GET'
      ? json({ authenticated: true }, 200)
      : json({ error: 'Método não permitido' }, 405)
  if (pathname === '/api/books') return books(request, env.DB, null)
  const match =
    /^\/api\/books\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.exec(
      pathname,
    )
  if (match?.[1]) return books(request, env.DB, match[1])
  return json({ error: 'Não encontrado' }, 404)
}

export default { fetch: handleRequest }
