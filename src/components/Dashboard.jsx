import { useMemo } from 'react'
import { Banknote, ChevronRight, Home, UtensilsCrossed, Wallet } from 'lucide-react'
import { useMealsData } from '../context/MealsContext'
import { monthKey } from '../lib/dates'
import { computeMonthStats } from '../lib/meals'
import { formatMoney } from '../lib/format'
import MonthNav from './MonthNav'
import MonthCalendar from './MonthCalendar'
import SettleCycle from './SettleCycle'
import { MonthDonut, RecentDays, WeekBars } from './PanelCharts'

/*
 * PANEL - mosaico (bento).
 *
 * Cambio de fondo respecto a la versión anterior: antes eran 6 tarjetas
 * iguales en fila y el calendario aparte, así que nada mandaba y el ojo no
 * sabía a dónde ir. Ahora el panel es un MOSAICO: la cifra que importa va
 * grande arriba (el total a pagar) y el resto son tarjetas de distinto
 * tamaño según su peso -el calendario el más grande, porque es donde se
 * trabaja- con el donut, las barras y los últimos días como apoyo.
 *
 * El orden y el tamaño de las áreas los define `.bento` en index.css: en
 * móvil cae a una columna; en escritorio el calendario a la izquierda y la
 * columna de apoyo a la derecha. Una sola instancia de cada componente:
 * sólo cambia el área del grid, no se duplica nada.
 *
 * La acción (liquidar) va PEGADA AL CALENDARIO, no al final. Motivo: liquidar
 * es el cierre natural de marcar los días. Antes caía detrás de donut, barras
 * y lista, 543px más abajo, y en móvil quedaba fuera de pantalla (había que
 * scrollear 476px para verlo). Tres tarjetas de lectura interpuestas entre
 * donde se trabaja y lo que cierra el mes.
 *
 * Los dos modos se respetan: en claro se conserva el relleno profundo con
 * texto blanco; en oscuro los estados usan su color VIVO con el número
 * oscuro encima (se lee mejor y el calendario se distingue de un golpe).
 */

/** Tarjeta de una cifra de estado. */
function MiniStat({ label, value, sub, icon: Icon, tone }) {
  const skins = {
    school: 'border-school-500 bg-school-500 dark:border-transparent dark:bg-vivid-school',
    home: 'border-home-500 bg-home-500 dark:border-transparent dark:bg-vivid-home',
  }
  // Texto: blanco en claro; oscuro (tinta de celda) en oscuro sobre el vivo.
  const ink = 'text-white dark:text-cell-ink'
  return (
    <div className={`flex min-w-0 flex-col justify-center gap-0.5 rounded-2xl border p-2.5 ${skins[tone]}`}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className={`size-3.5 shrink-0 ${ink}`} />}
        <span className={`truncate text-[9.5px] font-extrabold uppercase tracking-wide ${ink}`}>{label}</span>
      </div>
      <p className={`text-2xl font-extrabold leading-none tabular-nums 2xl:text-3xl 3xl:text-4xl ${ink}`}>{value}</p>
      {sub && <p className={`truncate text-[10px] leading-tight ${ink} opacity-85`}>{sub}</p>}
    </div>
  )
}

export default function Dashboard({ month, onMonthChange }) {
  const { meals, price, loading } = useMealsData()
  const stats = useMemo(() => computeMonthStats(meals, monthKey(month), price), [meals, month, price])

  const { schoolPending, schoolPaid, home, pendingTotal } = stats
  const alDia = schoolPending === 0

  const sub = alDia
    ? schoolPaid > 0
      ? `${schoolPaid} ${schoolPaid === 1 ? 'día liquidado' : 'días liquidados'}`
      : 'Sin pendientes este mes'
      : `${schoolPending} ${schoolPending === 1 ? 'comida pendiente' : 'comidas pendientes'} por pagar`

  // El separador vive en el propio string, no en el arbol JSX: ahi el espacio se conserva.
  const pagados = schoolPaid > 0 && !alDia
    ? ` · ${schoolPaid} ${schoolPaid === 1 ? 'día ya pagado' : 'días ya pagados'}`
    : ''

  return (
    <section aria-label="Panel de control y finanzas" className="bento flex-1">
      {/* ---------- LA CIFRA: manda ---------- */}
      <div className="area-hero panel flex flex-col justify-between gap-3 p-4 2xl:p-6 3xl:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="panel-lbl">{alDia ? 'Al día' : 'Total a pagar'}</p>
            <p
              className={`truncate text-4xl font-extrabold leading-none tracking-tight tabular-nums lg:text-5xl 2xl:text-6xl 3xl:text-7xl ${
                alDia ? 'text-home-600 dark:text-vivid-home' : 'text-brand-600 dark:text-lima-400'
              }`}
            >
              {formatMoney(pendingTotal)}
            </p>
            <p className="mt-1.5 truncate text-xs text-ink-600 dark:text-nightink-400">
                {sub}{pagados}
            </p>
          </div>
          {/* El único acento fuerte de la pantalla: el ojo va directo aquí. */}
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
              alDia
                ? 'bg-home-100 text-home-600 dark:bg-vivid-home dark:text-cell-ink'
                : 'bg-brand-100 text-brand-600 dark:bg-lima-400 dark:text-lima-ink'
            }`}
          >
            {alDia ? <Banknote className="size-5" strokeWidth={2.5} /> : <Wallet className="size-5" strokeWidth={2.5} />}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[10.5px] font-bold text-ink-700 dark:bg-night-800 dark:text-nightink-400">
            Pagados: <b className="tabular-nums">{schoolPaid}</b>
          </span>
          <span className="rounded-full bg-surface-100 px-2.5 py-1 text-[10.5px] font-bold text-ink-700 dark:bg-night-800 dark:text-nightink-400">
            Precio: <b className="tabular-nums">{formatMoney(price)}</b>
          </span>
        </div>
      </div>

      {/* ---------- Las dos cifras medianas ---------- */}
      <div className="area-mini grid grid-cols-2 gap-2.5 lg:grid-cols-1 2xl:gap-3.5">
        <MiniStat
          label="Comedor"
          value={schoolPending}
          sub={`${formatMoney(schoolPending * price)} por pagar`}
          icon={UtensilsCrossed}
          tone="school"
        />
        <MiniStat label="Comida de casa" value={home} sub="Sin costo" icon={Home} tone="home" />
      </div>

      {/* ---------- El calendario: el más grande, es donde se trabaja ---------- */}
      <div className="area-cal flex min-h-0 flex-col gap-2.5">
        <MonthNav month={month} onChange={onMonthChange} />
        <div className="flex min-h-0 flex-1 flex-col">
          <MonthCalendar month={month} />
        </div>
          <SettleCycle month={month} price={price} loading={loading} />
      </div>
      {/* ---------- Apoyo: de qué se compuso el mes ---------- */}
      <div className="area-donut panel p-3.5 2xl:p-5 3xl:p-6">
        <p className="panel-lbl mb-2.5">Reparto del mes</p>
        {loading ? (
          <div className="h-24 animate-pulse rounded-xl bg-surface-100 dark:bg-night-800" />
        ) : (
          <MonthDonut stats={stats} />
        )}
      </div>

      {/* ---------- Gasto por semana ---------- */}
      <div className="area-bars panel p-3.5 2xl:p-5 3xl:p-6">
        <p className="panel-lbl mb-2.5">Gasto por semana</p>
        {loading ? (
          <div className="h-16 animate-pulse rounded-xl bg-surface-100 dark:bg-night-800" />
        ) : (
          <WeekBars meals={meals} month={month} price={price} />
        )}
      </div>

      {/* ---------- Últimos días ---------- */}
      <div className="area-list panel p-3.5 2xl:p-5 3xl:p-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="panel-lbl">Últimos días</p>
          <ChevronRight className="size-3.5 text-ink-600 dark:text-nightink-500" />
        </div>
        {loading ? (
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-7 animate-pulse rounded-lg bg-surface-100 dark:bg-night-800" />
            ))}
          </div>
        ) : (
          <RecentDays meals={meals} month={month} price={price} />
        )}
      </div>
    </section>
  )
}
