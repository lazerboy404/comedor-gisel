import { useMemo } from 'react'
import { formatMoney } from '../lib/format'
import { STATUS } from '../lib/meals'

/*
 * Gráficos del panel: el donut (de qué se compuso el mes) y las barras
 * (cómo se repartió el gasto por semana).
 *
 * Todo SVG a mano, sin librería: son dos formas simples y así no se suma
 * una dependencia sólo por esto.
 *
 * El color de cada estado sale de las MISMAS variables que el calendario,
 * así el donut, las celdas y las tarjetas nunca se contradicen.
 */

const COLOR = {
  [STATUS.SCHOOL]: 'var(--color-vivid-school)',
  [STATUS.HOME]: 'var(--color-vivid-home)',
  [STATUS.ABSENT]: 'var(--color-vivid-absent)',
  [STATUS.NO_CLASS]: 'var(--color-vivid-noclass)',
}

const R = 46
const C = 2 * Math.PI * R

/** Un arco del donut, por estado. */
function Arc({ offset, value, total, color }) {
  const len = (C * value) / total
  return (
    <circle
      cx="60"
      cy="60"
      r={R}
      fill="none"
      stroke={color}
      strokeWidth="16"
      strokeDasharray={`${len.toFixed(2)} ${(C - len).toFixed(2)}`}
      strokeDashoffset={(-(C * offset) / total).toFixed(2)}
      transform="rotate(-90 60 60)"
    />
  )
}

export function MonthDonut({ stats }) {
  const segs = [
    { key: STATUS.SCHOOL, label: 'Comedor', value: stats.schoolPending + stats.schoolPaid, money: true },
    { key: STATUS.HOME, label: 'Comida de casa', value: stats.home },
    { key: STATUS.ABSENT, label: 'Ausencia', value: stats.absent },
    { key: STATUS.NO_CLASS, label: 'Sin clases', value: stats.noClass },
  ].filter((s) => s.value > 0)

  const total = segs.reduce((a, s) => a + s.value, 0)

  if (total === 0) {
    return (
      <p className="py-4 text-center text-xs text-ink-600 dark:text-nightink-500">
        Aún no hay días marcados este mes.
      </p>
    )
  }

  let acc = 0
  return (
    <div className="flex items-center gap-4">
      <div
          className="relative shrink-0"
          style={{ width: "var(--donut-size, 118px)", maxWidth: "100%", aspectRatio: "1" }}
        >
        <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="16" className="text-surface-100 dark:text-night-800" />
          {segs.map((s) => {
            const el = <Arc key={s.key} offset={acc} value={s.value} total={total} color={COLOR[s.key]} />
            acc += s.value
            return el
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <b className="text-lg font-extrabold leading-none tabular-nums">{total}</b>
          <small className="text-[9px] font-semibold uppercase tracking-wide text-ink-600 dark:text-nightink-500">
            días
          </small>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5">
        {segs.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: COLOR[s.key] }} />
            <span className="min-w-0 flex-1 truncate text-ink-700 dark:text-nightink-400">{s.label}</span>
            <b className="shrink-0 tabular-nums">{s.value}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Barras del gasto por semana del mes.
 * El alto es relativo a la semana más alta del mes, así el gráfico se
 * ajusta solo y la comparación entre semanas es honesta.
 */
export function WeekBars({ meals, month, price }) {
  const weeks = useMemo(() => {
    const y = month.getFullYear()
    const m = month.getMonth()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const buckets = [0, 0, 0, 0, 0]
    let max = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const meal = meals[key]
      if (meal?.status !== STATUS.SCHOOL || meal.paid) continue
      // semana del mes = en cuál de las 5 franjas cae el día
      const idx = Math.min(4, Math.floor((d - 1) / 7))
      buckets[idx] += 1
    }

    max = Math.max(...buckets, 1)
    return buckets.map((n, i) => ({ n, money: n * price, pct: (n / max) * 100, i, top: n === max && n > 0 }))
  }, [meals, month, price])

  const totalSem = weeks.reduce((a, w) => a + w.n, 0)

  if (totalSem === 0) {
    return (
      <p className="py-3 text-center text-xs text-ink-600 dark:text-nightink-500">
        Sin días de comedor pendientes.
      </p>
    )
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        {weeks.map((w) => (
          <div key={w.i} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="bar-track w-full">
              <div className={`bar${w.top ? ' top' : ''}`} style={{ height: `${Math.max(w.pct, 4)}%` }} />
            </div>
            <small className="text-[10px] font-semibold tabular-nums text-ink-600 dark:text-nightink-500">
              {w.money > 0 ? formatMoney(w.money) : '—'}
            </small>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[9px] font-semibold uppercase tracking-wide text-ink-600 dark:text-nightink-500">
        <span>Sem 1</span>
        <span>Sem 5</span>
      </div>
    </div>
  )
}

/**
 * Últimos días del mes con algo marcado. Es la lista de "qué pasó
 * últimamente" sin tener que recorrer el calendario.
 */
export function RecentDays({ meals, month, price }) {
  const rows = useMemo(() => {
    const y = month.getFullYear()
    const m = month.getMonth()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const out = []

    for (let d = daysInMonth; d >= 1 && out.length < 4; d--) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const meal = meals[key]
      if (!meal?.status) continue
      out.push({ key, d, meal })
    }
    return out
  }, [meals, month])

  if (rows.length === 0) {
    return (
      <p className="py-3 text-center text-xs text-ink-600 dark:text-nightink-500">
        Todavía no hay días marcados.
      </p>
    )
  }

  const ETIQUETA = {
    [STATUS.SCHOOL]: 'Comedor',
    [STATUS.HOME]: 'Comida de casa',
    [STATUS.ABSENT]: 'Ausencia',
    [STATUS.NO_CLASS]: 'Sin clases',
  }

  return (
    <ul className="space-y-1.5">
      {rows.map(({ key, d, meal }) => (
        <li key={key} className="flex items-center gap-2.5">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold tabular-nums"
            style={{ background: COLOR[meal.status], color: 'var(--color-cell-ink)' }}
          >
            {d}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-ink-700 dark:text-nightink-400">
            {ETIQUETA[meal.status]}
            {meal.paid && <span className="ml-1.5 text-[10px] font-bold text-school-600 dark:text-lima-400">pagado</span>}
          </span>
          <b className="shrink-0 text-xs tabular-nums">
            {meal.status === STATUS.SCHOOL ? formatMoney(price) : '—'}
          </b>
        </li>
      ))}
    </ul>
  )
}