import { CalendarOff, CalendarX2, CircleSlash, Home, UtensilsCrossed } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { STATUS } from '../lib/meals'

const OPTIONS = [
  { value: STATUS.HOME, label: 'Comida de casa', sub: 'Sin costo ($0)', icon: Home },
  { value: STATUS.SCHOOL, label: 'Comedor', sub: 'Come en la escuela', icon: UtensilsCrossed },
  { value: STATUS.ABSENT, label: 'Ausencia', sub: 'No aplica', icon: CalendarX2 },
  { value: STATUS.NO_CLASS, label: 'No hubo clases', sub: 'Festivo o suspensión', icon: CalendarOff },
  { value: null, label: 'Sin marca', sub: 'Limpia el día', icon: CircleSlash },
]

// Estados activos: relleno sólido opaco con tinta blanca (contraste >= 4.5:1).
const ACTIVE_CLASS = {
  [STATUS.HOME]: 'border-home-600 bg-home-500 text-white shadow-sm',
  [STATUS.SCHOOL]: 'border-school-600 bg-school-500 text-white shadow-sm',
  [STATUS.ABSENT]: 'border-absent-600 bg-absent-500 text-white shadow-sm',
  [STATUS.NO_CLASS]: 'border-noclass-400 bg-noclass-600 text-white shadow-sm',
  null: 'border-ink-700 bg-ink-800 text-white shadow-sm dark:border-white/25 dark:bg-white/15 dark:text-white',
}

/** Selector de estados (compartido por detalle de día y rango) */
export default function StatusPicker({ value, onChange, price }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((o) => {
        const active = value === o.value
        const wide = o.value === null
        return (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all active:scale-95 ${
              wide ? 'col-span-2' : ''
            } ${
              active
                ? ACTIVE_CLASS[String(o.value)]
                : 'border-surface-200 bg-white text-ink-800 hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:bg-night-900 dark:text-white/60 dark:hover:border-brand-400 dark:hover:bg-white/5'
            }`}
          >
            <o.icon className="size-5" />
            <span className="text-center text-sm font-semibold leading-tight">{o.label}</span>
            <span className={`text-[11px] ${active ? 'text-white/85' : 'opacity-80'}`}>
              {o.value === STATUS.SCHOOL ? `${o.sub} · ${formatMoney(price)}` : o.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}