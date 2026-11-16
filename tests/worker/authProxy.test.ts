import { afterEach, describe, expect, it, vi } from 'vitest'
import { proxyFirebaseAuth } from '../../worker/authentication/proxy'

afterEach(() => vi.unstubAllGlobals())
describe('Firebase authentication proxy', () => {
  it('forwards helper requests to the configured Firebase domain without a browser redirect', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('helper', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const response = await proxyFirebaseAuth(
      new Request('https://library.example/__/auth/iframe?x=1'),
      'example-project',
    )
    expect(response.status).toBe(200)
    const args = fetchMock.mock.calls[0]
    expect((args?.[0] as Request).url).toBe(
      'https://example-project.firebaseapp.com/__/auth/iframe?x=1',
    )
    expect(args?.[1]).toEqual({ redirect: 'manual' })
  })
  it('rejects untrusted destinations, unrelated paths and unsupported methods', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(
      (await proxyFirebaseAuth(new Request('https://library.example/__/auth/iframe'), '../evil'))
        .status,
    ).toBe(503)
    expect(
      (await proxyFirebaseAuth(new Request('https://library.example/api/books'), 'example-project'))
        .status,
    ).toBe(404)
    expect(
      (
        await proxyFirebaseAuth(
          new Request('https://library.example/__/auth/iframe', { method: 'DELETE' }),
          'example-project',
        )
      ).status,
    ).toBe(405)
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('returns a generic failure if Firebase is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('private detail')))
    const response = await proxyFirebaseAuth(
      new Request('https://library.example/__/auth/iframe'),
      'example-project',
    )
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private detail')
  })
})

it('routes Firebase helper requests before private API authorization', async () => {
  const { handleRequest } = await import('../../worker/index')
  const fetchMock = vi.fn().mockResolvedValue(new Response('helper', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
  const db = {
    prepare: () => {
      throw new Error('Must not access database')
    },
  }
  const response = await handleRequest(new Request('https://library.example/__/auth/iframe'), {
    DB: db as unknown as import('../../worker/database').Database,
    FIREBASE_PROJECT_ID: 'example-project',
  })
  expect(response.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledOnce()
})
