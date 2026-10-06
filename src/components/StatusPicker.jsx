import { CalendarOff, CalendarX2, CircleSlash, Home, UtensilsCrossed } from 'lucide-react'
import { formatMoney } from '../lib/format'
import { STATUS } from '../lib/meals'

const OPTIONS = [
  { value: STATUS.HOME, label: 'Comida de casa', sub: 'Sin costo ($0)', icon: Home },
  { value: STATUS.SCHOOL, label: 'Comedor', sub: 'Come en la escuela', icon: UtensilsCrossed },
  { value: STATUS.ABSENT, label: 'Ausencia', sub: 'No aplica', icon: CalendarX2 },
  { value: STATUS.NO_CLASS, label: 'No hubo clases', sub: 'Festivo o suspensión', icon: CalendarOff },
  { value: null, label: 'Sin marca', sub: 'Borra el estado del día', icon: CircleSlash, action: true },
]

// Estados activos: relleno sólido opaco con tinta blanca (contraste >= 4.5:1).
const ACTIVE_CLASS = {
  [STATUS.HOME]: 'border-home-600 bg-home-500 text-white shadow-sm',
  [STATUS.SCHOOL]: 'border-school-600 bg-school-500 text-white shadow-sm',
  [STATUS.ABSENT]: 'border-absent-600 bg-absent-500 text-white shadow-sm',
  [STATUS.NO_CLASS]: 'border-noclass-400 bg-noclass-600 text-white shadow-sm',
}

const IDLE_CLASS =
  'border-surface-200 bg-white text-ink-800 hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:bg-night-900 dark:text-white/60 dark:hover:border-brand-400 dark:hover:bg-white/5'

/*
 * "Sin marca" NO es un estado: es la ACCIÓN de borrar el estado del día.
 * Antes se pintaba como seleccionada en los días sin estado, porque su value
 * es null y el borrador también valía null: parecía que el día ya tenía ese
 * estado elegido. Ahora nunca se muestra como seleccionada, y el borde
 * discontinuo deja claro que es una acción y no una opción más.
 * La forma de saber que un día no tiene estado es que NINGUNA opción está
 * pintada (el modal muestra además la etiqueta del estado actual).
 */
const ACTION_CLASS =
  'border-dashed border-surface-300 bg-transparent text-ink-700 hover:border-absent-500 hover:bg-absent-500/5 hover:text-absent-600 dark:border-white/15 dark:text-white/45 dark:hover:border-absent-400 dark:hover:text-absent-300'

/** Selector de estados (compartido por detalle de día y rango) */
export default function StatusPicker({ value = null, onChange, price }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((o) => {
        const active = !o.action && value === o.value
        const wide = o.value === null
        const stateClass = o.action ? ACTION_CLASS : active ? ACTIVE_CLASS[String(o.value)] : IDLE_CLASS
        return (
          <button
            key={o.label}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={o.action ? undefined : active}
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all active:scale-95 ${
              wide ? 'col-span-2' : ''
            } ${stateClass}`}
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