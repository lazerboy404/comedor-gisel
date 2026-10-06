import { Banknote, CalendarOff, CalendarX2, Home, StickyNote, UtensilsCrossed } from 'lucide-react'
import { formatLongDate, isToday, isWeekend, toKey } from '../lib/dates'
import { STATUS, STATUS_META } from '../lib/meals'

const BASE =
  'relative flex touch-none flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border text-[13px] font-semibold leading-none transition-all select-none [-webkit-touch-callout:none] min-h-[var(--cal-row)] lg:gap-1 lg:rounded-xl lg:text-base'

/**
 * Un día hábil (L-V) del calendario. El calendario es el protagonista de la
 * pantalla: relleno SÓLIDO y opaco del color del estado + tinta blanca.
 *
 * Contraste de la tinta blanca sobre cada relleno (>= 4.5:1):
 *   home-500   #35705f  5.78:1
 *   school-500 #7d6214  5.79:1
 *   absent-500 #a33a3a  6.51:1
 *   noclass-600 #4b5563 7.56:1
 *
 * El estado no depende solo del color: cada uno lleva su propio ÍCONO y
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
        className={`${BASE} cursor-default border-transparent bg-transparent text-ink-700/50 dark:text-white/20`}
      >
        <span>{date.getDate()}</span>
      </div>
    )
  }

  const stateClass =
    status === STATUS.HOME
      ? 'border-home-600 bg-home-500 text-white'
      : status === STATUS.SCHOOL
        // El día pagado conserva EXACTAMENTE el mismo color: lo único que
        // cambia es el billete de la esquina. Oscurecerlo confundía, porque
        // un día de comedor pagado seguía siendo comida en el comedor.
        ? 'border-school-600 bg-school-500 text-white'
        : status === STATUS.ABSENT
          ? 'border-absent-600 bg-absent-500 text-white'
          : status === STATUS.NO_CLASS
            // Sin clases: relleno neutro sólido + borde discontinuo (forma, no solo color)
            ? 'border-dashed border-noclass-400 bg-noclass-600 text-white'
            // Sin marcar: neutro, sin color (no compite con los estados)
            : 'border-surface-200 bg-white text-ink-700/70 hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-night-900 dark:text-white/40 dark:hover:border-brand-400/40 dark:hover:bg-white/5'

  const Icon =
    status === STATUS.HOME
      ? Home
      : status === STATUS.SCHOOL
        ? UtensilsCrossed
        : status === STATUS.ABSENT
          ? CalendarX2
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
      className={`${BASE} ${stateClass} active:scale-90 ${inRange ? 'ring-2 ring-white ring-inset' : ''}`}
    >
      {/* "Hoy": subrayado con la tinta del propio relleno (blanco sobre color, tinta sobre neutro) */}
      <span className={today ? 'font-extrabold underline decoration-2 underline-offset-[3px]' : undefined}>
        {date.getDate()}
      </span>
      {Icon && <Icon className="size-3.5 opacity-95 lg:size-4" />}
      {paid && (
        <span
          title="Pagado"
          aria-label="Pagado"
          className="absolute right-0.5 top-0.5 flex size-3.5 items-center justify-center rounded-full bg-white text-school-700 shadow-sm lg:right-1 lg:top-1 lg:size-5"
        >
          <Banknote className="size-2 lg:size-3" strokeWidth={2.5} />
        </span>
      )}
      {note && <StickyNote className="absolute bottom-1 left-1 size-3 opacity-75" aria-hidden="true" />}
    </button>
  )
}