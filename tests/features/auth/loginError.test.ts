import { describe, expect, it } from 'vitest'
import { loginErrorMessage } from '../../../src/features/auth/loginError'

describe('login error messages', () => {
  it('offers guidance for known domain, popup and network errors', () => {
    expect(loginErrorMessage({ code: 'auth/unauthorized-domain' })).toContain(
      'domínios autorizados',
    )
    expect(loginErrorMessage({ code: 'auth/popup-blocked' })).toContain('bloqueou')
    expect(loginErrorMessage({ code: 'auth/network-request-failed' })).toContain('conexão')
  })
  it('does not reveal unknown error details', () => {
    expect(loginErrorMessage({ code: 'unexpected-secret' })).not.toContain('unexpected-secret')
    expect(loginErrorMessage(null)).toBe('Não foi possível entrar com o Google. Tente novamente.')
  })
})
