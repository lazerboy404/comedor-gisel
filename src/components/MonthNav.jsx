import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, monthTitle, sameMonth, startOfMonth } from '../lib/dates'

/** Navegación de mes compartida por todas las vistas */
export default function MonthNav({ month, onChange }) {
  const isCurrent = sameMonth(month, new Date())

  return (
    <div className="flex shrink-0 items-center justify-between gap-2">
      <h2 className="truncate text-lg font-bold tracking-tight 2xl:text-2xl">{monthTitle(month)}</h2>
      <div className="flex shrink-0 items-center gap-1.5">
        {!isCurrent && (
          <button
            type="button"
            onClick={() => onChange(startOfMonth(new Date()))}
            className="rounded-full border border-surface-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-white/15 dark:bg-night-900 dark:text-white/60 dark:hover:border-brand-400 dark:hover:text-brand-200"
          >
            Hoy
          </button>
        )}
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => onChange(addMonths(month, -1))}
          className="flex size-8 items-center justify-center rounded-full border border-surface-200 bg-white text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-white/15 dark:bg-night-900 dark:text-white/60 dark:hover:border-brand-400 dark:hover:text-brand-200"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => onChange(addMonths(month, 1))}
          className="flex size-8 items-center justify-center rounded-full border border-surface-200 bg-white text-ink-800 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-white/15 dark:bg-night-900 dark:text-white/60 dark:hover:border-brand-400 dark:hover:text-brand-200"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}