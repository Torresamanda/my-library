import { authenticate, type AuthEnvironment } from './auth'

interface Database {
  prepare(query: string): { first<T>(): Promise<T | null> }
}

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

/** All API routes require authorization except the data-free health check. */
export async function handleRequest(request: Request, env: Environment): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname === '/api/health') {
    return request.method === 'GET' ? health(env) : json({ error: 'Método não permitido' }, 405)
  }
  if (!pathname.startsWith('/api/')) return json({ error: 'Não encontrado' }, 404)
  if (!(await authenticate(request, env))) return json({ error: 'Acesso não autorizado' }, 401)
  if (pathname === '/api/session') {
    return request.method === 'GET'
      ? json({ authenticated: true }, 200)
      : json({ error: 'Método não permitido' }, 405)
  }
  return json({ error: 'Não encontrado' }, 404)
}

export default { fetch: handleRequest }
