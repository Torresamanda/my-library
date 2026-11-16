import { initializeApp } from '@firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from '@firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
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
  await signInWithPopup(auth, provider)
}

export async function logout(): Promise<void> {
  if (auth) await signOut(auth)
}
