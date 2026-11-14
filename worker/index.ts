interface Database {
  prepare(query: string): { first<T>(): Promise<T | null> }
}

export interface Environment {
  DB: Database
}

function json(body: object, status: number): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}

/** Public health check returns no library data; all future data routes must authorize first. */
export async function handleRequest(request: Request, env: Environment): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname !== '/api/health') return json({ error: 'Não encontrado' }, 404)
  if (request.method !== 'GET') return json({ error: 'Método não permitido' }, 405)

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

export default { fetch: handleRequest }
