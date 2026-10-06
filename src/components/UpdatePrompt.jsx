import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Aviso de versión nueva.
 *
 * Sin esto, la app instalada (PWA) puede seguir sirviendo la versión anterior
 * desde la caché del service worker: el despliegue ya está en el servidor pero
 * se sigue viendo lo viejo, sin ningún aviso. Pasó en la práctica (el color de
 * los días pagados se veía distinto en el celular y en la computadora).
 *
 * Con registerType 'prompt', el service worker nuevo queda ESPERANDO y aquí se
 * le avisa a la persona para que recargue cuando le convenga.
 */
export default function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh || dismissed) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-brand-300 bg-white p-3 shadow-2xl animate-slide-up dark:border-brand-500/40 dark:bg-night-800"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
        <RefreshCw className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900 dark:text-white">Hay una versión nueva</p>
        <p className="text-[11px] leading-tight text-ink-700 dark:text-white/50">
          Recarga para ver los últimos cambios.
        </p>
      </div>

      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-xl bg-brand-400 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-brand-500 active:scale-95"
      >
        Recargar
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Descartar aviso"
        className="shrink-0 rounded-lg p-1.5 text-ink-700 transition-colors hover:bg-surface-100 dark:text-white/40 dark:hover:bg-white/10"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}