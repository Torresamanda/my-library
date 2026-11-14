import { createRemoteJWKSet, jwtVerify } from 'jose'

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'))

/** Verifies a Firebase ID token and restricts access to one configured Firebase UID. */
export async function authenticate(request, env, keySet = googleKeys) {
  if (!env.FIREBASE_PROJECT_ID || !env.ALLOWED_FIREBASE_UID) return false
  const header = request.headers.get('Authorization') || ''
  const match = /^Bearer ([^\s]+)$/.exec(header)
  if (!match) return false
  try {
    const { payload } = await jwtVerify(match[1], keySet, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
      requiredClaims: ['sub', 'iat', 'exp', 'auth_time'],
    })
    const now = Math.floor(Date.now() / 1000)
    return payload.sub === env.ALLOWED_FIREBASE_UID && typeof payload.auth_time === 'number' && payload.auth_time <= now && payload.iat <= now && payload.firebase?.sign_in_provider === 'google.com'
  } catch {
    return false
  }
}
