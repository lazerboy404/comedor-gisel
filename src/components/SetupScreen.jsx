import { Settings, TriangleAlert } from 'lucide-react'
import { missingFirebaseVars } from '../lib/firebase'

/** Pantalla que aparece cuando .env.local aún no tiene las claves de Firebase */
export default function SetupScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-night-900 animate-slide-up">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
            <Settings className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Configuración pendiente</h1>
            <p className="text-sm text-ink-700 dark:text-white/45">Falta conectar Firebase</p>
          </div>
        </div>

        <ol className="list-decimal space-y-2.5 pl-5 text-sm text-ink-800 dark:text-white/70">
          <li>
            Crea un proyecto en{' '}
            <a
              className="font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300"
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noreferrer"
            >
              console.firebase.google.com
            </a>
            .
          </li>
          <li>
            Activa <b>Authentication</b> (proveedor Google) y <b>Firestore Database</b>.
          </li>
          <li>
            En ️ <b>Configuración del proyecto &gt; Tus apps</b> registra una app web y copia su{' '}
            <code className="rounded bg-surface-100 px-1 py-0.5 text-xs dark:bg-white/10">firebaseConfig</code>.
          </li>
          <li>
            Copia <code className="rounded bg-surface-100 px-1 py-0.5 text-xs dark:bg-white/10">.env.local.example</code>{' '}
            como <code className="rounded bg-surface-100 px-1 py-0.5 text-xs dark:bg-white/10">.env.local</code> y pega
            los valores.
          </li>
          <li>Reinicia el servidor: <b>npm run dev</b></li>
        </ol>

        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Variables faltantes:{' '}
            <span className="font-mono text-xs font-semibold">{missingFirebaseVars.join(', ')}</span>
          </p>
        </div>

        <p className="mt-4 text-xs text-ink-700/70 dark:text-white/30">
          La guía completa con capturas está en el README del proyecto.
        </p>
      </div>
    </div>
  )
}