import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useMealsData } from '../context/MealsContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from './Loader'

/** Configuración del precio por comida (guardado en Firestore). `embedded` quita el marco dentro de modales */
export default function PriceConfig({ embedded = false }) {
  const { price, setPrice } = useMealsData()
  const toast = useToast()
  const [draft, setDraft] = useState(String(price))
  const [saving, setSaving] = useState(false)

  // Sincroniza si el precio cambia en otro dispositivo
  useEffect(() => {
    setDraft(String(price))
  }, [price])

  const parsed = Number(draft.replace(',', '.'))
  const valid = draft.trim() !== '' && Number.isFinite(parsed) && parsed >= 0
  const dirty = valid && parsed !== price

  async function handleSave() {
    if (!valid || !dirty) return
    setSaving(true)
    const ok = await setPrice(parsed)
    setSaving(false)
    toast(ok ? 'Precio por comida actualizado' : 'No se pudo guardar el precio. Revisa tu conexión.', ok ? 'success' : 'error')
  }

  const content = (
    <>
      <label htmlFor="precio-comida" className="text-sm font-semibold">
        Precio por comida en el comedor
      </label>
      <p className="mt-0.5 text-xs text-ink-700 dark:text-white/45">
        Se guarda en la nube y se aplica en todos tus dispositivos.
      </p>
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-ink-700/70">
            $
          </span>
          <input
            id="precio-comida"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9.,]/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
            }}
            placeholder="0.00"
            className="w-full rounded-xl border border-surface-300 bg-white py-2.5 pl-7 pr-3 text-sm font-semibold tabular-nums outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25 dark:border-white/10 dark:bg-night-950"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || !valid || saving}
          className="flex items-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? <Spinner className="size-4" /> : <Save className="size-4" />}
          Guardar
        </button>
      </div>
    </>
  )

  if (embedded) return content
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-night-900">
      {content}
    </div>
  )
}