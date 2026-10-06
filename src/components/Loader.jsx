import { LoaderCircle, UtensilsCrossed } from 'lucide-react'

export function Spinner({ className = 'size-5' }) {
  return <LoaderCircle className={`animate-spin ${className}`} aria-hidden="true" />
}

export function FullScreenLoader({ label = 'Cargando…' }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-brand-400 text-white shadow-lg shadow-brand-400/25">
        <UtensilsCrossed className="size-8 animate-pulse" />
      </div>
      <p className="flex items-center gap-2 text-sm text-ink-700 dark:text-white/45">
        <Spinner className="size-4" />
        {label}
      </p>
    </div>
  )
}

/** Esqueleto del calendario mientras Firestore carga (llena el espacio disponible) */
export function SkeletonCalendar() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col rounded-2xl border border-surface-200 bg-white p-2.5 dark:border-white/10 dark:bg-night-900"
      aria-hidden="true"
    >
      <div className="mb-1 grid shrink-0 grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-2.5 animate-pulse rounded-full bg-surface-200 dark:bg-white/10" />
        ))}
      </div>
      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-1.5"
        style={{ gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}
      >
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-surface-200 dark:bg-white/10" />
        ))}
      </div>
    </div>
  )
}