/** Converts known Firebase sign-in failures into actionable messages without exposing raw errors. */
export function loginErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null
  switch (code) {
    case 'auth/unauthorized-domain':
      return 'Este endereço ainda não foi autorizado no Firebase. Verifique os domínios autorizados.'
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela de login. Permita janelas para este site e tente novamente.'
    case 'auth/popup-closed-by-user':
      return 'A janela de login foi fechada antes da conclusão. Tente novamente.'
    case 'auth/network-request-failed':
      return 'Não foi possível conectar ao Google. Confira sua conexão e tente novamente.'
    case 'auth/cancelled-popup-request':
      return 'A tentativa de login foi cancelada. Tente novamente.'
    default:
      return 'Não foi possível entrar com o Google. Tente novamente.'
  }
}
