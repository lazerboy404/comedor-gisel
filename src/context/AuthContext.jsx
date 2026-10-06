import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase'

const AuthContext = createContext(null)

/** Traduce los códigos de error de Firebase Auth a mensajes claros en español */
export function authErrorToMessage(err) {
  const code = err?.code || ''
  switch (code) {
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente. Se abrirá el inicio de sesión en otra pestaña.'
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.'
    case 'auth/unauthorized-domain':
      return 'Este dominio no está autorizado en Firebase. Agrégalo en: Authentication > Settings > Authorized domains.'
    case 'auth/operation-not-allowed':
      return 'El inicio de sesión con Google no está habilitado en tu proyecto (Authentication > Sign-in method).'
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-.-please-pass-a-valid-api-key.':
      return 'La configuración de Firebase no es válida. Revisa tu archivo .env.local'
    case 'auth/configuration-not-found':
      return 'Falta configurar Authentication en tu proyecto de Firebase (proveedor Google).'
    default:
      return err?.message || 'Ocurrió un error inesperado al iniciar sesión.'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setInitializing(false)
      return undefined
    }
    // Cierra el ciclo del inicio de sesión por REDIRECCIÓN (cuando el navegador
    // bloquea la ventana emergente, sobre todo en móviles). Sin esto, Google
    // devuelve al usuario a la app pero nadie lee el resultado, la sesión no se
    // crea y la persona vuelve a ver la pantalla de login sin ningún error.
    getRedirectResult(auth).catch((err) => {
      if (err?.code === 'auth/unauthorized-domain') setError(authErrorToMessage(err))
      else console.warn('[auth] No se completó el acceso por redirección:', err)
    })
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) await ensureUserDoc(firebaseUser)
      setInitializing(false)
    })
    return unsubscribe
  }, [])

  // Crea users/{uid} la primera vez que se inicia sesión
  async function ensureUserDoc(firebaseUser) {
    if (!db) return
    try {
      const ref = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          childName: 'Gisel',
          precioComida: 38,
          createdAt: serverTimestamp(),
        })
      }
    } catch (err) {
      console.warn('[auth] No se pudo inicializar el documento del usuario:', err)
    }
  }

  const login = useCallback(async () => {
    if (!auth || !googleProvider) {
      setError('Firebase no está configurado. Completa tu archivo .env.local')
      return
    }
    setError(null)
    setSigningIn(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      // En móviles la ventana emergente suele estar bloqueada: usar redirect
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, googleProvider)
          return
        } catch (redirectErr) {
          setError(authErrorToMessage(redirectErr))
          return
        } finally {
          setSigningIn(false)
        }
      }
      // Si el usuario canceló a propósito, no reclamar. Pero un popup cerrado
      // sin intervención del usuario (bloqueo o cierre automático) sí debe
      // avisar y ofrecer la redirección, o el usuario se queda sin saber qué pasó.
      if (err?.code === 'auth/cancelled-popup-request') return
      if (err?.code === 'auth/popup-closed-by-user') return
      setError(authErrorToMessage(err))
    } finally {
      setSigningIn(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (!auth) return
    try {
      await signOut(auth)
    } catch (err) {
      console.error('[auth] Error al cerrar sesión:', err)
    }
  }, [])

  const value = useMemo(
    () => ({ user, initializing, signingIn, error, login, logout }),
    [user, initializing, signingIn, error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

export { GoogleAuthProvider }
