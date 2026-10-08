import { Banknote, CalendarOff, Home, StickyNote, UtensilsCrossed } from 'lucide-react'
import { CryingFace } from './StatusIcons'
import { formatLongDate, isToday, isWeekend, toKey } from '../lib/dates'
import { STATUS, STATUS_META } from '../lib/meals'

const BASE =
  'relative flex touch-none flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border text-[13px] font-semibold leading-none transition-all select-none [-webkit-touch-callout:none] min-h-[var(--cal-row)] lg:gap-1 lg:rounded-xl lg:text-base'

/**
 * Un día hábil (L-V) del calendario. El calendario es el protagonista de la
 * pantalla: relleno SÓLIDO y opaco del color del estado.
 *
 * MODO CLARO — relleno profundo + tinta blanca (contrastes >= 4.5:1):
 *   home-500    #35705f  5.78:1
 *   school-500  #7d6214  5.79:1  (día por pagar)
 *   absent-500  #a33a3a  6.51:1
 *   noclass-600 #4b5563  7.56:1
 *
 * MODO OSCURO — el mismo estado usa su color VIVO con el NÚMERO OSCURO
 * encima (`--color-cell-ink`). Blanco sobre estos vivos daba entre 1.1:1 y
 * 2.2:1 (ilegible); con la tinta oscura suben a 6.3:1 - 15.9:1. Además el
 * vivo despega del fondo azul-noche, así que el mes se lee de un golpe.
 *   school  #f2a65a  9.21:1
 *   home    #7ee0a8 11.64:1
 *   absent  #ff8095  7.78:1
 *   noclass #9aa3b8  7.37:1
 *
 * DÍA PAGADO:
 *   claro  -> tenue (school-100 sobre school-800), como "inhabilitado".
 *   oscuro -> panel elevado con el número apagado y un punto LIMA (`.paid-mark`),
 *             que es la señal de "ya está resuelto" sin competirle a lo pendiente.
 *
 * El estado no depende sólo del color: cada uno lleva su propio ÍCONO y
 * "Sin clases" usa además borde discontinuo.
 */
export default function DayCell({ date, meal, onOpenDetail, onDayPointerDown, inRange }) {
  if (!date) return <div aria-hidden="true" className="min-h-0" />

  const key = toKey(date)
  const status = meal?.status || null
  const weekend = isWeekend(date)
  const paid = status === STATUS.SCHOOL && meal?.paid
  const today = isToday(date)
  const note = meal?.note || ''

  if (weekend) {
    return (
      <div
        aria-label={`${formatLongDate(key)} (fin de semana)`}
        className={`${BASE} cursor-default border-transparent bg-transparent text-ink-700/50 dark:text-nightink-500/60`}
      >
        <span>{date.getDate()}</span>
      </div>
    )
  }

  const stateClass =
    status === STATUS.HOME
      ? 'border-dashed border-cell-ink/25 bg-vivid-home text-cell-ink'
      : status === STATUS.SCHOOL
        // Ya pagado: en claro, tenue. En oscuro, panel elevado + punto lima.
        ? paid
          ? 'border-school-300 bg-school-100 text-school-800 opacity-80 dark:border-night-700 dark:bg-night-800 dark:text-nightink-500 dark:opacity-100'
          : 'border-transparent bg-vivid-school text-cell-ink'
        : status === STATUS.ABSENT
          ? 'border-transparent bg-vivid-absent text-cell-ink'
          : status === STATUS.NO_CLASS
            // Sin clases: relleno neutro sólido + borde discontinuo (forma, no sólo color)
            ? 'border-dashed border-cell-ink/25 bg-vivid-noclass text-cell-ink'
            // Sin marcar: neutro, sin color (no compite con los estados)
            : 'border-surface-200 bg-white text-ink-700/70 hover:border-brand-300 hover:bg-brand-50 dark:border-night-700 dark:bg-night-900 dark:text-nightink-500 dark:hover:border-lima-400/40 dark:hover:bg-night-800'

  const Icon =
    status === STATUS.HOME
      ? Home
      : status === STATUS.SCHOOL
        ? UtensilsCrossed
        : status === STATUS.ABSENT
          ? CryingFace
          : status === STATUS.NO_CLASS
            ? CalendarOff
            : null

  const statusLabel = status ? STATUS_META[status].label : 'sin marcar'
  const hoy = today ? ' (hoy)' : ''
  const ariaLabel = `${formatLongDate(key)}${hoy} — ${statusLabel}. Toca para elegir opciones.`
  const title = `${formatLongDate(key)}${hoy} — ${statusLabel}${note ? ` · ${note}` : ''}`

  return (
    <button
      type="button"
      data-date={key}
      aria-label={ariaLabel}
      title={title}
      onPointerDown={(e) => onDayPointerDown(key, e)}
      onContextMenu={(e) => {
        e.preventDefault()
        onOpenDetail(key)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetail(key)
        }
      }}
      className={`${BASE} ${stateClass} active:scale-90 ${inRange ? 'ring-2 ring-inset ring-brand-400 dark:ring-lima-400' : ''}`}
    >
      {/* "Hoy": subrayado con la tinta del propio relleno */}
      <span className={today ? 'font-extrabold underline decoration-2 underline-offset-[3px]' : undefined}>
        {date.getDate()}
      </span>
      {Icon && <Icon className="size-3.5 opacity-95 lg:size-4" />}
      {paid && (
        <span
          title="Pagado"
          aria-label="Pagado"
          className="paid-mark absolute right-0.5 top-0.5 flex size-3.5 items-center justify-center rounded-full bg-school-800 text-white shadow-sm lg:right-1 lg:top-1 lg:size-5 dark:bg-lima-400 dark:text-lima-ink"
        >
          <Banknote className="size-2 lg:size-3" strokeWidth={2.5} />
        </span>
      )}
      {note && <StickyNote className="absolute bottom-1 left-1 size-3 opacity-75" aria-hidden="true" />}
    </button>
  )
}