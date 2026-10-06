import { useState } from 'react'
import { Save, StickyNote } from 'lucide-react'
import { formatLongDate } from '../lib/dates'
import { STATUS } from '../lib/meals'
import { useToast } from '../context/ToastContext'
import Modal from './Modal'
import StatusPicker from './StatusPicker'

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
        <p className="mb-3 rounded-xl bg-home-100 px-3 py-2 text-xs font-medium text-home-800 dark:bg-home-900 dark:text-home-100">
          Este día ya fue liquidado (pagado).
        </p>
      )}

      <p className="mb-2 text-xs font-semibold text-ink-700 dark:text-white/45">Estado</p>
      <StatusPicker value={statusDraft} onChange={setStatusDraft} price={price} />

      {isSchool && (
        <button
          type="button"
          role="switch"
          aria-checked={paidDraft}
          onClick={() => setPaidDraft((p) => !p)}
          className={`mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 transition-all active:scale-[0.98] ${
            paidDraft
              ? 'border-home-600 bg-home-500 dark:border-home-500 dark:bg-home-600'
              : 'border-surface-200 bg-white dark:border-white/10 dark:bg-night-900'
          }`}
        >
          <span className="text-left">
            <span className="block text-sm font-semibold">Ya lo pagaste</span>
            <span
              className={`block text-[11px] ${paidDraft ? 'text-home-800 dark:text-home-50' : 'text-ink-700 dark:text-white/45'}`}
            >
              {paidDraft ? 'No sumará al total a pagar' : 'Sigue sumando al total a pagar'}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
              paidDraft ? 'justify-end bg-white/80' : 'justify-start bg-surface-300 dark:bg-white/20'
            }`}
          >
            <span className="size-5 rounded-full bg-white shadow" />
          </span>
        </button>
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
        className="mt-1.5 w-full resize-none rounded-xl border border-surface-300 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25 dark:border-white/10 dark:bg-night-950"
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
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-brand-500 active:scale-95"
        >
          <Save className="size-4" />
          Guardar
        </button>
      </div>
    </Modal>
  )
}