import { useMemo } from 'react'
import { useMealsData } from '../context/MealsContext'
import { monthKey } from '../lib/dates'
import { computeMonthStats } from '../lib/meals'
import MonthNav from './MonthNav'
import SummaryCards from './SummaryCards'
import MonthCalendar from './MonthCalendar'
import SettleCycle from './SettleCycle'

/**
 * Dashboard principal.
 * - Móvil: una pantalla sin scroll (KPIs + calendario + liquidar), en columna.
 * - Escritorio (lg+): el calendario ocupa una columna ancha y los KPIs/acciones
 *   van en una barra lateral. Una sola instancia de cada componente: las áreas
 *   del grid (definidas en index.css, clase .dashboard-grid) solo reordenan.
 */
export default function Dashboard({ month, onMonthChange }) {
  const { meals, price, loading } = useMealsData()
  const stats = useMemo(() => computeMonthStats(meals, monthKey(month), price), [meals, month, price])

  return (
    <section
      aria-label="Panel de control y finanzas"
      className="dashboard-grid flex min-h-0 flex-1 flex-col gap-2.5"
    >
      <div className="dg-nav min-h-0">
        <MonthNav month={month} onChange={onMonthChange} />
      </div>
      <div className="dg-cards min-h-0">
        <SummaryCards stats={stats} price={price} loading={loading} />
      </div>
      <div className="dg-cal flex min-h-0 flex-col">
        <MonthCalendar month={month} />
      </div>
      <div className="dg-settle min-h-0">
        <SettleCycle month={month} stats={stats} loading={loading} />
      </div>
    </section>
  )
}