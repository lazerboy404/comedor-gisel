import { useState } from 'react'
import { Banknote, Save, StickyNote } from 'lucide-react'
import { formatLongDate } from '../lib/dates'
import { STATUS, STATUS_META } from '../lib/meals'
import { useToast } from '../context/ToastContext'
import Modal from './Modal'
import StatusPicker from './StatusPicker'

// Color del estado actual, el mismo relleno del calendario (un color por estado).
const CURRENT_CHIP = {
  [STATUS.HOME]: 'bg-vivid-home',
  [STATUS.SCHOOL]: 'bg-vivid-school',
  [STATUS.ABSENT]: 'bg-vivid-absent',
  [STATUS.NO_CLASS]: 'bg-vivid-noclass',
}

/** Detalle de un día: estado + nota opcional (p. ej. qué llevó de comer) + pagado */
export default function DayDetailModal({ dateKey, meal, price, onClose, onSave }) {
  const toast = useToast()
  const [statusDraft, setStatusDraft] = useState(() => meal?.status || null)
  const [noteDraft, setNoteDraft] = useState(() => meal?.note || '')
  const [paidDraft, setPaidDraft] = useState(() => meal?.paid ?? false)
  const paid = meal?.status === STATUS.SCHOOL && meal?.paid
  const isSchool = statusDraft === STATUS.SCHOOL

  function handleSave() {
    onSave(dateKey, {
      status: statusDraft,
      note: noteDraft,
      paid: isSchool ? paidDraft : (meal?.paid ?? false),
    })
    toast('Día actualizado')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={formatLongDate(dateKey)}>
      {paid && (
        <p className="mb-3 flex items-center gap-1.5 rounded-xl border border-school-200 bg-school-50 px-3 py-2 text-xs font-medium text-school-800 dark:border-school-800 dark:bg-school-950 dark:text-school-200">
          <Banknote className="size-3.5 shrink-0" />
          Este día ya fue liquidado (pagado).
        </p>
      )}

      {/* Estado actual, dicho con palabras: así no hay que deducirlo del color.
          Ninguna opción se pinta cuando el día no tiene estado. */}
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-white/45">
        <span>Estado actual:</span>
        {meal?.status ? (
          <span className={`rounded-full px-2 py-0.5 text-white ${CURRENT_CHIP[meal.status]}`}>
            {STATUS_META[meal.status].label}
          </span>
        ) : (
          <span className="rounded-full border border-dashed border-surface-300 px-2 py-0.5 text-ink-700 dark:border-white/20 dark:text-white/45">
            sin marcar
          </span>
        )}
      </p>
      <StatusPicker value={statusDraft} onChange={setStatusDraft} price={price} />

      {isSchool && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-school-300 bg-school-100 dark:border-school-800 dark:bg-school-950">
          <div className="flex items-center gap-2 border-b border-school-200 px-3.5 py-2 dark:border-school-800/60">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-school-700 text-white dark:bg-white dark:text-school-800">
              <Banknote className="size-3" strokeWidth={2.5} />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-school-800 dark:text-school-200">
              Pago de este día
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={paidDraft}
            onClick={() => setPaidDraft((p) => !p)}
            className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-all active:scale-[0.99]"
          >
            <span>
              <span className="block text-sm font-semibold text-school-800 dark:text-school-100">Ya lo pagaste</span>
              <span className="block text-[11px] text-school-800/70 dark:text-school-200/70">
                {paidDraft ? 'No sumará al total a pagar' : 'Sigue sumando al total a pagar'}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                paidDraft ? 'justify-end bg-school-500' : 'justify-start bg-school-200 dark:bg-school-800'
              }`}
            >
              <span className="size-5 rounded-full bg-white shadow" />
            </span>
          </button>
        </div>
      )}

      <label
        htmlFor="nota-dia"
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ink-700 dark:text-white/45"
      >
        <StickyNote className="size-3.5" />
        ¿Qué llevó de comer?
      </label>
      <textarea
        id="nota-dia"
        rows={2}
        value={noteDraft}
        onChange={(e) => setNoteDraft(e.target.value)}
        placeholder="Ej.: sándwich de pollo y fruta (opcional, solo lo ves tú)"
        className="mt-1.5 w-full resize-none rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25 dark:border-night-700 dark:bg-night-950 dark:focus:border-lima-400 dark:focus:ring-lima-400/25"
      />

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-surface-300 px-4 py-3 text-sm font-semibold text-ink-800 transition-colors hover:bg-surface-100 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/5"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-brand-500 active:scale-95 dark:bg-lima-400 dark:text-lima-ink dark:hover:bg-lima-300"
        >
          <Save className="size-4" />
          Guardar
        </button>
      </div>
    </Modal>
  )
}