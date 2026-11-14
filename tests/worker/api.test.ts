import { describe, expect, it, vi } from 'vitest'
import { handleRequest, type Environment } from '../../worker/index'
import { authenticate } from '../../worker/auth'

vi.mock('../../worker/auth', () => ({ authenticate: vi.fn().mockResolvedValue(false) }))

function database(result: unknown): Environment {
  return {
    DB: {
      prepare: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(result) }),
    } as unknown as Environment['DB'],
  }
}

describe('API health', () => {
  it('checks the migrated database without disclosing book counts', async () => {
    const env = database({ total: 7 })
    const response = await handleRequest(new Request('http://localhost/api/health'), env)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
    expect(env.DB.prepare).toHaveBeenCalledWith('SELECT COUNT(*) AS total FROM books')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })
  it('returns a generic error when the database is unavailable', async () => {
    const env: Environment = {
      DB: {
        prepare: () => ({
          first: async () => {
            throw new Error('private details')
          },
        }),
      } as unknown as Environment['DB'],
    }
    const response = await handleRequest(new Request('http://localhost/api/health'), env)
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private details')
  })
  it('does not expose other endpoints or accept other methods', async () => {
    const env = database({ total: 0 })
    expect((await handleRequest(new Request('http://localhost/api/books'), env)).status).toBe(401)
    expect(
      (await handleRequest(new Request('http://localhost/api/health', { method: 'POST' }), env))
        .status,
    ).toBe(405)
    expect(env.DB.prepare).not.toHaveBeenCalled()
  })
})

describe('private API routes', () => {
  it('rejects requests without authorization, even for unrecognized API paths', async () => {
    vi.mocked(authenticate).mockResolvedValue(false)
    const env = database({ total: 0 })
    for (const path of ['/api/session', '/api/books']) {
      const response = await handleRequest(new Request(`http://localhost${path}`), env)
      expect(response.status).toBe(401)
      expect(response.headers.get('cache-control')).toBe('no-store')
    }
    expect(env.DB.prepare).not.toHaveBeenCalled()
  })
  it('permits a verified session and does not reveal identity details', async () => {
    vi.mocked(authenticate).mockResolvedValue(true)
    const env = database({ total: 0 })
    const request = new Request('http://localhost/api/session', {
      headers: { Authorization: 'Bearer example' },
    })
    const response = await handleRequest(request, env)
    expect(authenticate).toHaveBeenCalledWith(request, env)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ authenticated: true })
    expect(env.DB.prepare).not.toHaveBeenCalled()
    expect((await handleRequest(new Request('http://localhost/api/unknown'), env)).status).toBe(404)
    expect(
      (await handleRequest(new Request('http://localhost/api/session', { method: 'POST' }), env))
        .status,
    ).toBe(405)
  })
})
