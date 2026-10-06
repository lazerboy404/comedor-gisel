import { useMemo, useState } from 'react'
import { Banknote, CircleCheck, Copy, ReceiptText, Undo2, UtensilsCrossed } from 'lucide-react'
import { useMealsData } from '../context/MealsContext'
import { useToast } from '../context/ToastContext'
import { monthKey, monthTitle, formatLongDate, formatShortDate } from '../lib/dates'
import { formatMoney } from '../lib/format'
import { buildReportText, computeMonthStats, paidDaysOfMonth, pendingDaysOfMonth } from '../lib/meals'
import { copyToClipboard } from '../lib/clipboard'
import MonthNav from './MonthNav'
import { SkeletonCalendar } from './Loader'

/**
 * Vista de reporte ("modo confrontación"): fechas exactas y no pagadas
 * en las que Gisel comió en el comedor escolar, más el historial de días
 * ya marcados como pagados (que se pueden desmarcar).
 */
export default function Report({ month, onMonthChange }) {
  const { meals, price, childName, loading, markPaid } = useMealsData()
  const toast = useToast()
  const [busyKey, setBusyKey] = useState(null)

  const key = monthKey(month)
  const pending = useMemo(() => pendingDaysOfMonth(meals, key), [meals, key])
  const paidDays = useMemo(() => paidDaysOfMonth(meals, key), [meals, key])
  const stats = useMemo(() => computeMonthStats(meals, key, price), [meals, key, price])
  const total = pending.length * price
  const name = childName || 'Gisel'

  async function handleTogglePaid(dateKey, nextPaid) {
    setBusyKey(dateKey)
    const ok = await markPaid(dateKey, nextPaid)
    setBusyKey(null)
    if (ok) {
      toast(
        nextPaid
          ? `${formatShortDate(dateKey)} marcado como pagado`
          : `${formatShortDate(dateKey)} devuelto a pendientes`,
        'success',
      )
    } else {
      toast('No se pudo actualizar. Revisa tu conexión.', 'error')
    }
  }

  async function handleCopy() {
    const text = buildReportText({ childName: name, monthName: monthTitle(month), days: pending, price })
    const ok = await copyToClipboard(text)
    toast(
      ok ? 'Resumen copiado — pégalo en tu chat con la escuela' : 'No se pudo copiar. Intenta de nuevo.',
      ok ? 'success' : 'error',
    )
  }

  return (
    <section
      aria-label="Reporte de comidas del comedor"
      className="flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <div className="mb-3 shrink-0">
        <MonthNav month={month} onChange={onMonthChange} />
      </div>

      {loading ? (
        <SkeletonCalendar />
      ) : (
        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start">
          {/* ---------- POR PAGAR ---------- */}
          <div className="rounded-2xl border border-surface-200 bg-white shadow-sm dark:border-white/10 dark:bg-night-900">
            <div className="flex items-center justify-between gap-3 border-b border-surface-100 p-4 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-school-100 text-school-800 dark:bg-school-900 dark:text-school-100">
                  <ReceiptText className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Comedor escolar — por pagar</h3>
                  <p className="text-xs text-ink-700 dark:text-white/45">
                    {pending.length === 0
                      ? 'Nada pendiente'
                      : `${pending.length} ${pending.length === 1 ? 'día sin pagar' : 'días sin pagar'}`}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-lg font-bold tabular-nums">{formatMoney(total)}</p>
            </div>

            {pending.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center animate-fade-in">
                <CircleCheck className="size-10 text-home-100" />
                <p className="font-semibold">Sin pendientes en {monthTitle(month)}</p>
                <p className="text-sm text-ink-700 dark:text-white/45">
                  {stats.schoolPaid > 0
                    ? `Este mes ya se marcaron ${stats.schoolPaid} ${stats.schoolPaid === 1 ? 'día' : 'días'} como pagados (${formatMoney(stats.paidTotal)}).`
                    : 'Cuando marques días como comedor, aparecerán aquí.'}
                </p>
              </div>
            ) : (
              <>
                <ol className="divide-y divide-surface-100 dark:divide-white/10">
                  {pending.map((k, i) => (
                    <li key={k} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="flex min-w-0 items-center gap-2.5 text-sm">
                        <span className="w-5 shrink-0 text-right text-xs font-semibold text-ink-700 tabular-nums">
                          {i + 1}.
                        </span>
                        <span className="truncate font-medium capitalize">{formatLongDate(k)}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-school-700 dark:text-school-50">
                          <UtensilsCrossed className="size-3.5" />
                          {formatMoney(price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePaid(k, true)}
                          disabled={busyKey === k}
                          aria-label={`Marcar ${formatShortDate(k)} como pagado`}
                          title="Marcar como pagado"
                          className="flex h-8 items-center gap-1 rounded-full border border-surface-200 px-2.5 text-xs font-semibold text-ink-700 transition-all hover:border-home-400 hover:text-home-600 active:scale-95 disabled:opacity-50 dark:border-white/15 dark:text-white/50 dark:hover:border-home-400 dark:hover:text-home-50"
                        >
                          <Banknote className="size-4" />
                          Pagar
                        </button>
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="border-t border-surface-100 p-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-300 px-4 py-3 text-sm font-semibold text-ink-800 transition-all hover:border-brand-400 hover:text-brand-700 active:scale-[0.98] dark:border-white/15 dark:text-white/80 dark:hover:border-brand-400 dark:hover:text-brand-200"
                  >
                    <Copy className="size-4" />
                    Copiar resumen para la escuela
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ---------- PAGADOS (historial) ---------- */}
          <div className="rounded-2xl border border-surface-200 bg-white shadow-sm dark:border-white/10 dark:bg-night-900">
            <div className="flex items-center justify-between gap-3 border-b border-surface-100 p-4 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-home-100 text-home-800 dark:bg-home-900 dark:text-home-100">
                  <Banknote className="size-5 text-school-700 dark:text-school-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Pagados este mes</h3>
                  <p className="text-xs text-ink-700 dark:text-white/45">
                    {paidDays.length === 0
                      ? 'Aún no marcas días'
                      : `${paidDays.length} ${paidDays.length === 1 ? 'día pagado' : 'días pagados'}`}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-lg font-bold tabular-nums">{formatMoney(stats.paidTotal)}</p>
            </div>

            {paidDays.length === 0 ? (
              <div className="p-6 text-center text-sm text-ink-700 dark:text-white/45">
                Cuando marques un día con <b>Pagar</b>, aparecerá aquí y podrás deshacerlo.
              </div>
            ) : (
              <>
                <ol className="divide-y divide-surface-100 dark:divide-white/10">
                  {paidDays.map((k) => (
                    <li key={k} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="flex min-w-0 items-center gap-2.5 text-sm">
                        <Banknote className="size-4 shrink-0 text-school-600 dark:text-school-300" />
                        <span className="truncate font-medium capitalize text-ink-800 line-through decoration-ink-700/40 dark:text-white/70">
                          {formatLongDate(k)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2.5">
                        <span className="text-sm font-semibold tabular-nums text-home-700 dark:text-home-50">
                          {formatMoney(price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePaid(k, false)}
                          disabled={busyKey === k}
                          aria-label={`Devolver ${formatShortDate(k)} a pendientes`}
                          title="Devolver a pendientes"
                          className="flex h-8 items-center gap-1 rounded-full border border-surface-200 px-2.5 text-xs font-semibold text-ink-700 transition-all hover:border-brand-400 hover:text-brand-700 active:scale-95 disabled:opacity-50 dark:border-white/15 dark:text-white/50 dark:hover:border-brand-400 dark:hover:text-brand-50"
                        >
                          <Undo2 className="size-4" />
                          Deshacer
                        </button>
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="border-t border-surface-100 p-3 text-center text-xs text-ink-700/80 dark:border-white/10 dark:text-white/35">
                  Los días pagados no suman al total por pagar, pero se conservan en el historial.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}