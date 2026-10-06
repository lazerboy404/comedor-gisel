import { useEffect, useRef, useState } from 'react'
import { Banknote } from 'lucide-react'
import { useMealsData } from '../context/MealsContext'
import { monthMatrix, toKey, weekdaysBetween, WEEKDAY_LABELS } from '../lib/dates'
import { formatMoney } from '../lib/format'
import DayCell from './DayCell'
import DayDetailModal from './DayDetailModal'
import RangeModal from './RangeModal'
import { SkeletonCalendar } from './Loader'

const DRAG_THRESHOLD_PX = 8

/**
 * Calendario con selección:
 * - Toque/clic (o clic derecho) en un día -> abre las opciones de ese día
 * - Mantener presionado y soltar -> lo mismo (opciones del día)
 * - Arrastrar sobre varios días -> selecciona un rango y abre las opciones del rango
 * - Arrastrar fuera del calendario y soltar -> cancela
 */
export default function MonthCalendar({ month }) {
  const { meals, price, loading, setDayDetail, applyRange, markPaidRange } = useMealsData()
  const weeks = monthMatrix(month)
  const [detailKey, setDetailKey] = useState(null) // opciones de UN día
  const [range, setRange] = useState(null) // opciones de un RANGO { from, to }
  const [highlight, setHighlight] = useState(null) // { from, to } mientras se arrastra
  const pressRef = useRef(null)
  const ghostUntilRef = useRef(0) // hasta cuándo descartar el próximo clic

  /*
   * El modal se abre al soltar el dedo (pointerup), pero el navegador emite un
   * 'click' DESPUÉS, en (casi) las mismas coordenadas. Como el modal ya está
   * montado encima, ese clic caía sobre un botón del modal: pintaba otro estado
   * y, si caía en "Comida de casa", ocultaba el interruptor de pagado.
   *
   * Solo pasa con toque real (con ratón el click llega antes de montar el modal).
   * Nota: NO se compara por posición. El navegador ajusta el punto del clic
   * sintetizado al elemento tocable más cercano, así que puede caer a varios px
   * (medido: 4-5 px, y más en pantallas reales) y una tolerancia fina lo deja
   * pasar. Se descarta el SIGUIENTE clic, una sola vez, dentro de una ventana
   * corta. Se arma solo para touch/pen, nunca para ratón, para no tragarse un
   * clic legítimo en escritorio.
   */
  function armGhostGuard() {
    ghostUntilRef.current = Date.now() + 500
  }

  useEffect(() => {
    function onDocClick(e) {
      const until = ghostUntilRef.current
      if (!until) return
      ghostUntilRef.current = 0 // una sola vez
      if (Date.now() > until) return
      e.stopPropagation()
      e.preventDefault()
    }
    // En captura: corre ANTES de que React vea el evento, así no llega al botón
    document.addEventListener('click', onDocClick, true)
    return () => document.removeEventListener('click', onDocClick, true)
  }, [])

  function cellKeyAt(x, y) {
    const el = document.elementFromPoint(x, y)
    const btn = el?.closest?.('[data-date]')
    return btn ? btn.dataset.date : null
  }

  function handleDayPointerDown(key, e) {
    if (e.button != null && e.button !== 0) return // clic derecho se maneja aparte
    pressRef.current = {
      key,
      x: e.clientX,
      y: e.clientY,
      moved: false,
      hoverKey: null,
      // Solo el toque sintetiza un clic tardío; con ratón el clic es legítimo
      touch: e.pointerType === 'touch' || e.pointerType === 'pen',
    }
  }

  useEffect(() => {
    function onMove(e) {
      const p = pressRef.current
      if (!p) return
      if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > DRAG_THRESHOLD_PX) p.moved = true
      if (!p.moved) return
      const k = cellKeyAt(e.clientX, e.clientY)
      if (k !== p.hoverKey) {
        p.hoverKey = k
        setHighlight(k && k !== p.key ? { from: p.key, to: k } : null)
      }
    }

    function onUp() {
      const p = pressRef.current
      if (!p) return
      pressRef.current = null
      setHighlight(null)
      const opensModal =
        p.moved ? !!(p.hoverKey && p.hoverKey !== p.key) : true
      if (opensModal && p.touch) armGhostGuard()
      if (p.moved) {
        // arrastre: rango si terminó sobre otro día; fuera del calendario = cancelar
        if (p.hoverKey && p.hoverKey !== p.key) setRange({ from: p.key, to: p.hoverKey })
      } else {
        // toque/clic/mantener presionado sin mover: opciones del día
        setDetailKey(p.key)
      }
    }

    function onCancel() {
      pressRef.current = null
      setHighlight(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
  }, [])

  function keyInRange(k) {
    if (!highlight) return false
    const a = highlight.from < highlight.to ? highlight.from : highlight.to
    const b = highlight.from < highlight.to ? highlight.to : highlight.from
    return k >= a && k <= b
  }

  const dragCount = highlight && highlight.from !== highlight.to ? weekdaysBetween(highlight.from, highlight.to).length : 0

  return (
    <section aria-label="Calendario mensual" className="flex min-h-0 flex-1 flex-col">
      {loading ? (
        <SkeletonCalendar />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-surface-200 bg-white p-2.5 shadow-md ring-1 ring-surface-100 dark:border-white/10 dark:bg-night-900 dark:ring-white/5 lg:p-4">
          <div className="mb-1 grid shrink-0 grid-cols-7 gap-1.5 border-b border-surface-200 pb-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-ink-600 dark:border-white/10 dark:text-white/45 lg:mb-2 lg:gap-2.5 lg:text-xs">
            {WEEKDAY_LABELS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div
            className="grid min-h-0 flex-1 grid-cols-7 gap-1.5 lg:gap-2.5"
            style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(var(--cal-row), 1fr))` }}
          >
            {weeks.flat().map((date) => (
              <DayCell
                key={date ? toKey(date) : 'blank'}
                date={date}
                meal={date ? meals[toKey(date)] : undefined}
                onOpenDetail={setDetailKey}
                onDayPointerDown={handleDayPointerDown}
                inRange={date ? keyInRange(toKey(date)) : false}
              />
            ))}
          </div>

          <div className="cal-legend mt-1.5 flex shrink-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[10px] leading-none text-ink-700 dark:text-white/45">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full border border-surface-300 bg-white dark:border-white/20 dark:bg-night-900" />
              Sin marca
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-[3px] bg-home-500" />
              Comida de casa ($0)
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-[3px] bg-school-500" />
              Comedor ({formatMoney(price)})
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-[3px] bg-absent-500" />
              Ausencia
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-[3px] border border-dashed border-noclass-400 bg-noclass-600" />
              Sin clases
            </span>
            <span className="flex items-center gap-1">
              <span className="relative flex size-3 items-center justify-center rounded-[3px] border border-school-300 bg-school-100 dark:border-school-800 dark:bg-school-950">
                <Banknote className="size-2 text-school-700 dark:text-school-200" />
              </span>
              Pagado
            </span>
            <span className="basis-full text-center text-ink-700/80 dark:text-white/35">
              Toca un día para elegir · Arrastra varios para aplicar estado o marcar pagados
            </span>
          </div>
        </div>
      )}

      {/* Contador en vivo mientras se arrastra */}
      {dragCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center">
          <span className="rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
            {dragCount} {dragCount === 1 ? 'día hábil' : 'días hábiles'} seleccionados
          </span>
        </div>
      )}

      {detailKey && (
        <DayDetailModal
          key={detailKey}
          dateKey={detailKey}
          meal={meals[detailKey]}
          price={price}
          onClose={() => setDetailKey(null)}
          onSave={setDayDetail}
        />
      )}

      {range && (
        <RangeModal
          from={range.from}
          to={range.to}
          count={weekdaysBetween(range.from, range.to).length}
          price={price}
          meals={meals}
          onClose={() => setRange(null)}
          onApply={applyRange}
          onMarkPaidRange={markPaidRange}
        />
      )}
    </section>
  )
}