import { beforeAll, describe, expect, it } from 'vitest'
import { generateKeyPair, SignJWT } from 'jose'
import { authenticate } from '../worker/auth'

const env = { FIREBASE_PROJECT_ID: 'test-project', ALLOWED_FIREBASE_UID: 'owner-uid' }
let privateKey: CryptoKey
let publicKey: CryptoKey
beforeAll(async () => {
  const keys = await generateKeyPair('RS256', { extractable: true })
  privateKey = keys.privateKey
  publicKey = keys.publicKey
})
async function token(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ auth_time: now, firebase: { sign_in_provider: 'google.com' }, ...overrides })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer('https://securetoken.google.com/test-project')
    .setAudience('test-project')
    .setSubject('owner-uid')
    .setIssuedAt(now)
    .setExpirationTime(now + 60)
    .sign(privateKey)
}

function request(value?: string) {
  return new Request('https://example.test/api/books', {
    headers: value ? { Authorization: `Bearer ${value}` } : {},
  })
}
describe('private access', () => {
  it('accepts a valid signed Google token only for the configured owner', async () => {
    expect(await authenticate(request(await token()), env, publicKey)).toBe(true)
    expect(
      await authenticate(
        request(await token()),
        { ...env, ALLOWED_FIREBASE_UID: 'someone-else' },
        publicKey,
      ),
    ).toBe(false)
  })
  it('fails closed for missing configuration, missing or invalid tokens, and other providers', async () => {
    expect(await authenticate(request(await token()), {}, publicKey)).toBe(false)
    expect(await authenticate(request(), env, publicKey)).toBe(false)
    expect(await authenticate(request('invalid'), env, publicKey)).toBe(false)
    expect(
      await authenticate(
        request(await token({ firebase: { sign_in_provider: 'password' } })),
        env,
        publicKey,
      ),
    ).toBe(false)
  })
  it('rejects future authentication time and a token for another project', async () => {
    expect(
      await authenticate(
        request(await token({ auth_time: Math.floor(Date.now() / 1000) + 500 })),
        env,
        publicKey,
      ),
    ).toBe(false)
    expect(
      await authenticate(
        request(await token()),
        { ...env, FIREBASE_PROJECT_ID: 'other-project' },
        publicKey,
      ),
    ).toBe(false)
  })
})
