import { useMemo, useState } from 'react'
import { Banknote, CalendarRange, Undo2 } from 'lucide-react'
import { formatShortDate } from '../lib/dates'
import { STATUS } from '../lib/meals'
import { useToast } from '../context/ToastContext'
import Modal from './Modal'
import StatusPicker from './StatusPicker'
import { Spinner } from './Loader'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/** Aplicar un estado a un rango de días hábiles de corrido */
export default function RangeModal({ from, to, count, price, meals, onClose, onApply, onMarkPaidRange }) {
  const toast = useToast()
  // OJO: null significa "borrar el estado del día", así que NO puede ser el
  // valor inicial. `undefined` = "todavía no eliges nada"; sin esto, el botón
  // de aplicar podría limpiar días sin que lo pidieras.
  // Antes venía "Comida de casa" pintado de fábrica y parecía ya decidido.
  const [statusDraft, setStatusDraft] = useState(undefined)
  const [busy, setBusy] = useState(null) // 'status' | 'paid' | 'unpaid' | null
  const hasStatus = statusDraft !== undefined

  // Días de COMEDOR dentro del rango: solo esos se pueden marcar como pagados
  const schoolInRange = useMemo(() => {
    const a = from < to ? from : to
    const b = from < to ? to : from
    return Object.keys(meals)
      .filter((k) => k >= a && k <= b && meals[k]?.status === STATUS.SCHOOL)
      .sort()
  }, [meals, from, to])
  const pendingInRange = schoolInRange.filter((k) => !meals[k]?.paid)
  const paidInRange = schoolInRange.filter((k) => meals[k]?.paid)

  async function handleApplyStatus() {
    if (!hasStatus) return
    setBusy('status')
    const res = await onApply(from, to, { status: statusDraft })
    setBusy(null)
    if (res.ok) {
      toast(`${res.count} ${res.count === 1 ? 'día actualizado' : 'días actualizados'}`)
      onClose()
    } else {
      toast('No se pudo aplicar el cambio. Revisa tu conexión.', 'error')
    }
  }

  async function handleMarkPaid(paid) {
    setBusy(paid ? 'paid' : 'unpaid')
    const res = await onMarkPaidRange(from, to, paid)
    setBusy(null)
    if (res.ok) {
      toast(
        res.count === 0
          ? 'No había días de comedor en ese rango'
          : paid
            ? `${res.count} ${res.count === 1 ? 'día marcado como pagado' : 'días marcados como pagados'}`
            : `${res.count} ${res.count === 1 ? 'día devuelto a pendientes' : 'días devueltos a pendientes'}`,
        'success',
      )
      onClose()
    } else {
      toast('No se pudo actualizar. Revisa tu conexión.', 'error')
    }
  }

  const title = cap(formatShortDate(from)) === cap(formatShortDate(to))
    ? cap(formatShortDate(from))
    : `${cap(formatShortDate(from))} → ${cap(formatShortDate(to))}`

  return (
    <Modal open onClose={busy ? () => {} : onClose} title={title}>
      <p className="mb-3 flex items-center gap-2 text-sm text-ink-800 dark:text-white/70">
        <CalendarRange className="size-4 shrink-0 text-absent-600 dark:text-absent-50" />
        {count} {count === 1 ? 'día hábil' : 'días hábiles'} — los fines de semana no se tocan
      </p>

      {/* ---------- Pago en bloque ---------- */}
      {schoolInRange.length > 0 && (
        <div className="mb-4 rounded-2xl border border-surface-200 bg-surface-50 p-3 dark:border-white/10 dark:bg-white/5">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-700 dark:text-white/50">
            <Banknote className="size-3.5" />
            Pagos del rango
          </p>
          <p className="mb-2.5 text-xs text-ink-700 dark:text-white/45">
            {pendingInRange.length} por pagar
            {paidInRange.length > 0 ? ` · ${paidInRange.length} ya pagados` : ''} de comedor
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleMarkPaid(true)}
              disabled={busy || pendingInRange.length === 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-home-600 bg-home-500 px-3 py-2.5 text-sm font-bold text-white transition-all hover:bg-home-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-home-500"
            >
              {busy === 'paid' ? <Spinner className="size-4" /> : <Banknote className="size-4" />}
              Marcar pagados
            </button>
            <button
              type="button"
              onClick={() => handleMarkPaid(false)}
              disabled={busy || paidInRange.length === 0}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-300 px-3 py-2.5 text-sm font-semibold text-ink-800 transition-all hover:border-brand-400 hover:text-brand-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-white/70"
            >
              {busy === 'unpaid' ? <Spinner className="size-4" /> : <Undo2 className="size-4" />}
              Deshacer
            </button>
          </div>
        </div>
      )}

      {/* ---------- Estado del rango ---------- */}
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-white/45">
        <span>Estado para todo el rango</span>
        {!hasStatus && (
          <span className="rounded-full border border-dashed border-surface-300 px-2 py-0.5 font-normal text-ink-700 dark:border-white/20 dark:text-white/45">
            elige uno
          </span>
        )}
      </p>
      <StatusPicker value={statusDraft} onChange={setStatusDraft} price={price} />

      <p className="mt-3 text-xs text-ink-700/80 dark:text-white/35">
        Se conservan las notas y los días ya marcados como pagados.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={!!busy}
          className="flex-1 rounded-xl border border-surface-300 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-surface-100 disabled:opacity-50 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/5"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleApplyStatus}
          disabled={!!busy || !hasStatus}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-brand-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === 'status' ? (
            <>
              <Spinner className="size-4" />
              Aplicando…
            </>
          ) : (
            'Aplicar al rango'
          )}
        </button>
      </div>
    </Modal>
  )
}