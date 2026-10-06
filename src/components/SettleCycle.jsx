import { useMemo, useState } from 'react'
import { Banknote } from 'lucide-react'
import { useMealsData } from '../context/MealsContext'
import { useToast } from '../context/ToastContext'
import { monthKey, monthTitle, formatShortDate } from '../lib/dates'
import { formatMoney } from '../lib/format'
import { pendingDaysOfMonth } from '../lib/meals'
import Modal from './Modal'
import { Spinner } from './Loader'

/** Botón + confirmación de "Liquidar ciclo" (marca los días como paid) */
export default function SettleCycle({ month, price, loading }) {
  const { meals, settleMonth } = useMealsData()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const key = monthKey(month)
  const pending = useMemo(() => pendingDaysOfMonth(meals, key), [meals, key])
  // El precio viene del contexto (prop `price`): `stats` no trae un campo price,
  // así que usar stats.price daba NaN y el total se mostraba como $0.00.
  const total = pending.length * price

  async function handleConfirm() {
    setBusy(true)
    const res = await settleMonth(key)
    setBusy(false)
    if (res.ok) {
      setOpen(false)
      toast(
        res.count > 0
          ? `Ciclo liquidado: ${res.count} ${res.count === 1 ? 'día marcado' : 'días marcados'} como pagados.`
          : 'No había días pendientes por liquidar.',
      )
    } else {
      toast('No se pudo liquidar el ciclo. Se conservan tus datos locales.', 'error')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading || pending.length === 0}
        className="flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-brand-400 bg-brand-400 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-surface-200 disabled:bg-surface-200 disabled:text-ink-700/60 disabled:shadow-none dark:disabled:border-white/10 dark:disabled:bg-white/5 dark:disabled:text-white/30"
      >
        <Banknote className="size-5" />
        {pending.length === 0
          ? 'Ciclo liquidado — sin pendientes'
          : `Liquidar ciclo de ${monthTitle(month)} (${formatMoney(total)})`}
      </button>

      <Modal open={open} onClose={() => !busy && setOpen(false)} title={`¿Liquidar ${monthTitle(month)}?`}>
        <p className="text-sm text-ink-800 dark:text-white/70">
          Se marcarán como <b>pagados</b> los <b>{pending.length}</b>{' '}
          {pending.length === 1 ? 'día pendiente' : 'días pendientes'} de comedor, dejarán de sumar al total y quedarán
          en el historial.
        </p>

        <div className="mt-3 max-h-44 overflow-y-auto rounded-xl border border-surface-200 p-2 text-xs dark:border-white/10">
          <ul className="space-y-1.5">
            {pending.map((k) => (
              <li key={k} className="flex items-center justify-between gap-2 text-ink-800 dark:text-white/70">
                <span className="capitalize">{formatShortDate(k)}</span>
                <span className="font-semibold tabular-nums">{formatMoney(price)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-100 px-3 py-2.5 text-sm font-bold dark:bg-white/5">
          <span>Total del ciclo</span>
          <span className="tabular-nums">{formatMoney(total)}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={busy}
            className="flex-1 rounded-xl border border-surface-300 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-surface-100 disabled:opacity-50 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-brand-500 active:scale-95 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Spinner className="size-4" />
                Liquidando…
              </>
            ) : (
              'Confirmar pago'
            )}
          </button>
        </div>
      </Modal>
    </>
  )
}