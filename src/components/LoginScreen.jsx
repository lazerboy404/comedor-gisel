import { useState } from 'react'
import { CircleAlert, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from './Loader'

function GoogleIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}

export default function LoginScreen() {
  const { login, error, signingIn } = useAuth()
  const [offline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center animate-slide-up">
        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl bg-brand-400 text-white shadow-lg shadow-brand-400/30">
          <UtensilsCrossed className="size-10" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Comedor Gisel</h1>
        <p className="mt-2 text-sm text-ink-700 dark:text-white/50">
          Registro infalible de las comidas escolares: paga solo lo justo, con historial en la nube.
        </p>

        <button
          type="button"
          onClick={login}
          disabled={signingIn}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-surface-300 bg-white px-4 py-3.5 text-sm font-semibold text-ink-800 shadow-sm transition-all hover:bg-surface-50 active:scale-[0.98] disabled:opacity-60 dark:border-white/15 dark:bg-night-900 dark:text-white/80 dark:hover:bg-night-800"
        >
          {signingIn ? <Spinner className="size-5" /> : <GoogleIcon />}
          {signingIn ? 'Abriendo sesión…' : 'Iniciar sesión con Google'}
        </button>

        {offline && (
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <CircleAlert className="size-3.5" />
            Se necesita internet la primera vez para iniciar sesión.
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-left text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="mt-6 text-xs text-ink-700/70 dark:text-white/30">
          Tus datos son privados: solo tu cuenta puede leerlos.
        </p>
      </div>
    </div>
  )
}