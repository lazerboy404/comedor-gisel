import { Banknote, CalendarOff, Wallet } from 'lucide-react'
import { CryingFace, HomeMeal, SchoolMeal } from './StatusIcons'
import { formatMoney } from '../lib/format'

function SkeletonCards() {
  return (
    <div
      className="kpi-strip grid shrink-0 grid-cols-4 gap-1.5 lg:grid-cols-2 lg:gap-2.5"
      aria-hidden="true"
    >
      {/* Fila 1 (total + pagados) y fila 2 (los 4 estados) */}
      <div className="col-span-3 animate-pulse rounded-2xl bg-surface-200 dark:bg-white/10 lg:col-span-2" />
      <div className="animate-pulse rounded-2xl bg-surface-200 dark:bg-white/10 lg:col-span-2" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-surface-200 dark:bg-white/10" />
      ))}
    </div>
  )
}

/*
 * UN SOLO COLOR POR ESTADO.
 * Cada tarjeta usa EXACTAMENTE el mismo relleno sólido que la celda de ese
 * estado en el calendario (misma clase Tailwind). Antes la tarjeta tenía su
 * propio tinte suave, así que el mismo estado aparecía en dos tonos y el ojo
 * contaba el doble de colores.
 *
 * Texto blanco sobre el relleno: 5.78 - 7.56:1 en los cuatro estados.
 */
const MINIS = [
  { key: 'school', label: 'Comedor', icon: SchoolMeal, fill: 'bg-school-500' },
  { key: 'home', label: 'Comida de casa', icon: HomeMeal, fill: 'bg-home-500' },
  { key: 'absent', label: 'Ausencia', icon: CryingFace, fill: 'bg-absent-500' },
  { key: 'noClass', label: 'Sin clases', icon: CalendarOff, fill: 'bg-noclass-600' },
]

/** Tarjetas de resumen dentro de la fila 1 del móvil (van juntas y compactas).
 *  Cada una: etiqueta con ícono arriba, número grande, subtexto. */
function WideCard({ alDia, pendingTotal, sub, schoolPaid }) {
  const fill = alDia ? 'border-home-600 bg-home-500' : 'border-brand-600 bg-brand-500'
  const Icon = alDia ? Banknote : Wallet
  return (
    <>
      <div className={`animate-fade-in col-span-3 flex min-w-0 flex-col justify-center overflow-hidden rounded-2xl border p-2.5 text-white shadow-sm lg:col-span-2 lg:p-4 ${fill}`}>
        <div className="flex items-center gap-1.5">
          <Icon className="size-3.5 shrink-0 lg:size-4" />
          <p className="truncate text-[10px] font-bold uppercase tracking-wide lg:text-xs">
            {alDia ? 'Al día' : 'Total a pagar'}
          </p>
        </div>
        <p className="truncate text-lg font-extrabold leading-tight tabular-nums sm:text-2xl lg:text-3xl">
          {formatMoney(pendingTotal)}
        </p>
        <p className="truncate text-[10px] leading-tight text-white/85 lg:text-xs">{sub}</p>
      </div>

      {/* Días ya pagados: tono TENUE, como inhabilitado. Está resuelto y no
          compite con lo que sigue pendiente. El billete es la señal de pago. */}
      <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl border border-school-300 bg-school-100 p-1.5 text-school-800 opacity-80 shadow-sm dark:border-school-800 dark:bg-school-950 dark:text-school-200 lg:col-span-2 lg:gap-1.5 lg:p-3">
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white text-school-700 lg:size-6 dark:bg-school-900 dark:text-school-200">
          <Banknote className="size-2.5 lg:size-4" strokeWidth={2.5} />
        </span>
        <p className="kpi-num text-xl font-extrabold leading-none tabular-nums lg:text-4xl">{schoolPaid}</p>
        <p className="w-full truncate text-center text-[9px] font-semibold uppercase tracking-wide opacity-75 lg:text-xs">
          Pagados
        </p>
      </div>
    </>
  )
}

/** Fila de resumen: total a pagar + días pagados (fila 1) y los 4 estados (fila 2).
 *  En móvil son 2 líneas para que cada etiqueta quepa completa; en escritorio el
 *  total va arriba a lo ancho y los estados se reparten en 2x2. */
export default function SummaryCards({ stats, price, loading }) {
  if (loading) return <SkeletonCards />

  const { schoolPending, schoolPaid, home, absent, noClass, pendingTotal, paidTotal } = stats
  const alDia = schoolPending === 0
  const values = { school: schoolPending, home, absent, noClass }

  const sub = alDia
    ? schoolPaid > 0
      ? `${schoolPaid} ${schoolPaid === 1 ? 'día liquidado' : 'días liquidados'} (${formatMoney(paidTotal)})`
      : 'Sin pendientes este mes'
    : `${schoolPending} × ${formatMoney(price)}`

  return (
    <div className="kpi-strip grid shrink-0 grid-cols-4 gap-1.5 lg:grid-cols-2 lg:gap-2.5">
      <WideCard alDia={alDia} pendingTotal={pendingTotal} sub={sub} schoolPaid={schoolPaid} />

      {/* Estados: mismo relleno que la celda del calendario */}
      {MINIS.map((m) => (
        <div
          key={m.key}
          className={`flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl border border-white/15 p-1.5 text-white shadow-sm lg:gap-1.5 lg:p-3 ${m.fill}`}
        >
          <m.icon className="kpi-icon size-3.5 shrink-0 lg:size-6" />
          <p className="kpi-num text-xl font-extrabold leading-none tabular-nums lg:text-4xl">{values[m.key]}</p>
          <p className="w-full text-center text-[9px] font-semibold uppercase leading-[1.15] tracking-wide text-white/85 lg:truncate lg:text-xs">
            {m.label}
          </p>
        </div>
      ))}
    </div>
  )
}