/** Forwards only Firebase helper paths to the configured Firebase Hosting domain. */
export async function proxyFirebaseAuth(
  request: Request,
  projectId: string | undefined,
): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'POST')
    return new Response('Method not allowed', { status: 405 })
  if (!projectId || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId))
    return new Response('Authentication unavailable', { status: 503 })
  const source = new URL(request.url)
  if (!source.pathname.startsWith('/__/auth/')) return new Response('Not found', { status: 404 })
  const target = new URL(`https://${projectId}.firebaseapp.com`)
  target.pathname = source.pathname
  target.search = source.search
  try {
    return await fetch(new Request(target, request), { redirect: 'manual' })
  } catch {
    return new Response('Authentication unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
