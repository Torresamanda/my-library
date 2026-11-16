import { initializeApp } from '@firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  getRedirectResult,
  signInWithRedirect,
  signInWithPopup,
  signOut,
  type User,
} from '@firebase/auth'

const useSameOriginAuth = window.location.protocol === 'https:'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: useSameOriginAuth ? window.location.host : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Object.values(config).every(
  (value) => typeof value === 'string' && value.trim().length > 0,
)
const auth = firebaseConfigured ? getAuth(initializeApp(config)) : null

export function observeUser(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback, () => callback(null))
}

export async function login(): Promise<void> {
  if (!auth) throw new Error('Firebase not configured')
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  if (useSameOriginAuth) {
    await signInWithRedirect(auth, provider)
  } else {
    await signInWithPopup(auth, provider)
  }
}

export async function logout(): Promise<void> {
  if (auth) await signOut(auth)
}

export async function completeRedirect(): Promise<void> {
  if (auth && useSameOriginAuth) await getRedirectResult(auth)
}
