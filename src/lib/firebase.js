import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const REQUIRED_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

/** Variables de entorno que faltan (para la pantalla de configuración) */
export const missingFirebaseVars = REQUIRED_ENV_KEYS.filter((key) => !import.meta.env[key])

export let app = null
export let auth = null
export let db = null
export let googleProvider = null
export let isFirebaseConfigured = false

if (missingFirebaseVars.length === 0) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    // Caché persistente: datos disponibles offline + escrituras optimistas que
    // se sincronizan solas al recuperar la conexión.
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
    googleProvider = new GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })
    isFirebaseConfigured = true
  } catch (err) {
    console.error('[firebase] Error al inicializar Firebase:', err)
  }
}
