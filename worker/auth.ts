import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'

export interface AuthEnvironment {
  FIREBASE_PROJECT_ID?: string
  ALLOWED_FIREBASE_UID?: string
}

const googleKeys = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
)

/** Verifies a Firebase ID token and restricts access to one configured Firebase UID. */
export async function authenticate(
  request: Request,
  env: AuthEnvironment,
  keySet: CryptoKey | JWTVerifyGetKey = googleKeys,
): Promise<boolean> {
  if (!env.FIREBASE_PROJECT_ID || !env.ALLOWED_FIREBASE_UID) return false

  const header = request.headers.get('Authorization') || ''
  const match = /^Bearer ([^\s]+)$/.exec(header)

  if (!match?.[1]) return false

  try {
    const { payload } = await jwtVerify(match[1], keySet, {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
      requiredClaims: ['sub', 'iat', 'exp', 'auth_time'],
    })

    const now = Math.floor(Date.now() / 1000)

    return (
      payload.sub === env.ALLOWED_FIREBASE_UID &&
      typeof payload.auth_time === 'number' &&
      payload.auth_time <= now &&
      typeof payload.iat === 'number' &&
      payload.iat <= now &&
      typeof payload.firebase === 'object' &&
      payload.firebase !== null &&
      'sign_in_provider' in payload.firebase &&
      payload.firebase.sign_in_provider === 'google.com'
    )
  } catch {
    return false
  }
}
