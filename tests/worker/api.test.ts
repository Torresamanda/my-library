import { describe, expect, it, vi } from 'vitest'
import { handleRequest, type Environment } from '../../worker/index'

function database(result: unknown): Environment {
  return {
    DB: {
      prepare: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(result) }),
    },
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
      },
    }
    const response = await handleRequest(new Request('http://localhost/api/health'), env)
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private details')
  })
  it('does not expose other endpoints or accept other methods', async () => {
    const env = database({ total: 0 })
    expect((await handleRequest(new Request('http://localhost/api/books'), env)).status).toBe(404)
    expect(
      (await handleRequest(new Request('http://localhost/api/health', { method: 'POST' }), env))
        .status,
    ).toBe(405)
    expect(env.DB.prepare).not.toHaveBeenCalled()
  })
})
