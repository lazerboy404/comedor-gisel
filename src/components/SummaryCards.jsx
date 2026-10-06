import { Banknote, CalendarOff, CalendarX2, Home, UtensilsCrossed, Wallet } from 'lucide-react'
import { formatMoney } from '../lib/format'

function SkeletonCards() {
  return (
    <div
      className="kpi-strip grid shrink-0 grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))] gap-2 lg:grid-cols-2 lg:gap-2.5"
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl bg-surface-200 dark:bg-white/10 ${i === 0 || i === 5 ? 'lg:col-span-2' : ''}`}
        />
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
  { key: 'school', label: 'Comedor', icon: UtensilsCrossed, fill: 'bg-school-500' },
  { key: 'home', label: 'Comida de casa', icon: Home, fill: 'bg-home-500' },
  { key: 'absent', label: 'Ausencia', icon: CalendarX2, fill: 'bg-absent-500' },
  { key: 'noClass', label: 'Sin clases', icon: CalendarOff, fill: 'bg-noclass-600' },
  /*
   * Días ya pagados. Se queda con el MISMO ocre de Comedor a propósito: un día
   * pagado es un día de comedor, y así no entra un sexto color a la pantalla.
   * La distinción la da el billete en círculo blanco, igual que la marca de la
   * celda del calendario. Va a lo ancho, arriba del botón de liquidar.
   */
  { key: 'paid', label: 'Pagados', icon: Banknote, fill: 'bg-school-500', badge: true, wide: true },
]

/** Fila compacta de KPIs: total a pagar + 4 estados del mes + días pagados.
 *  En móvil van los 6 en fila; en escritorio el total y los pagados a lo ancho. */
export default function SummaryCards({ stats, price, loading }) {
  if (loading) return <SkeletonCards />

  const { schoolPending, schoolPaid, home, absent, noClass, pendingTotal, paidTotal } = stats
  const alDia = schoolPending === 0
  const values = { school: schoolPending, home, absent, noClass, paid: schoolPaid }

  const sub = alDia
    ? schoolPaid > 0
      ? `${schoolPaid} ${schoolPaid === 1 ? 'día liquidado' : 'días liquidados'} (${formatMoney(paidTotal)})`
      : 'Sin pendientes este mes'
    : `${schoolPending} × ${formatMoney(price)}${schoolPaid > 0 ? ` · ${schoolPaid} pag.` : ''}`

  return (
    <div className="kpi-strip grid shrink-0 grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))] gap-2 lg:grid-cols-2 lg:gap-2.5">
      {/* Total a pagar (o al día): mismo tratamiento que las demás, un poco más grande */}
      <div
        className={`animate-fade-in flex min-w-0 flex-col justify-center overflow-hidden rounded-2xl border p-3 text-white shadow-sm lg:col-span-2 lg:p-4 ${
          alDia ? 'border-home-600 bg-home-500' : 'border-brand-600 bg-brand-500'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {alDia ? (
            <Banknote className="size-3.5 shrink-0 lg:size-4" />
          ) : (
            <Wallet className="size-3.5 shrink-0 lg:size-4" />
          )}
          <p className="truncate text-[10px] font-bold uppercase tracking-wide lg:text-xs">
            {alDia ? 'Al día' : 'Total a pagar'}
          </p>
        </div>
        <p className="truncate text-lg font-extrabold leading-tight tabular-nums sm:text-2xl lg:text-3xl">
          {formatMoney(pendingTotal)}
        </p>
        <p className="truncate text-[10px] leading-tight text-white/85 lg:text-xs">{sub}</p>
      </div>

      {/* Indicadores rápidos: mismo relleno que la celda del calendario.
          En escritorio crecen para llenar la columna. */}
      {MINIS.map((m) => (
        <div
          key={m.key}
          className={`flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl border border-white/15 p-1.5 text-white shadow-sm lg:gap-1.5 lg:p-3 ${m.wide ? 'lg:col-span-2' : ''} ${m.fill}`}
        >
          {m.badge ? (
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white text-school-600 lg:size-6">
              <m.icon className="size-2.5 lg:size-4" strokeWidth={2.5} />
            </span>
          ) : (
            <m.icon className="kpi-icon size-3.5 shrink-0 lg:size-6" />
          )}
          <p className="kpi-num text-xl font-extrabold leading-none tabular-nums lg:text-4xl">{values[m.key]}</p>
          <p className="w-full truncate text-center text-[9px] font-semibold uppercase tracking-wide text-white/85 lg:text-xs">
            {m.label}
          </p>
        </div>
      ))}
    </div>
  )
}