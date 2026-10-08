import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/index.css'
import { ToastProvider } from '../src/context/ToastContext'
import { MealsContext } from '../src/context/MealsContext'
import { useDarkMode } from '../src/hooks/useDarkMode'
import { startOfMonth } from '../src/lib/dates'
import { STATUS } from '../src/lib/meals'
import Header from '../src/components/Header'
import SyncStatus from '../src/components/SyncStatus'
import Dashboard from '../src/components/Dashboard'
import Report from '../src/components/Report'

/*
 * Banco de pruebas SOLO para auditoría de layout.
 * Monta los componentes reales con datos falsos (el dashboard vive detrás del
 * login de Google, que no se puede automatizar aquí). No toca la app real.
 */

const PRICE = 38

function buildMeals() {
  // Octubre 2026, con todos los estados y varios pagados para ver el 💵
  const meals = {}
  const map = {
    1: STATUS.HOME, 2: STATUS.SCHOOL, 5: STATUS.SCHOOL, 6: STATUS.SCHOOL,
    7: STATUS.HOME, 8: STATUS.SCHOOL, 9: STATUS.SCHOOL, 12: STATUS.ABSENT,
    13: STATUS.SCHOOL, 14: STATUS.SCHOOL, 15: STATUS.SCHOOL, 16: STATUS.HOME,
    19: STATUS.SCHOOL, 20: STATUS.SCHOOL, 21: STATUS.SCHOOL,
    // 22 queda SIN ESTADO a propósito: sirve para probar que el modal NO
    // preselecciona nada en un día vacío.
    23: STATUS.NO_CLASS, 26: STATUS.SCHOOL, 27: STATUS.SCHOOL, 28: STATUS.SCHOOL,
    29: STATUS.HOME, 30: STATUS.NO_CLASS,
  }
  const paidDays = [5, 6, 19, 20]
  for (const [d, status] of Object.entries(map)) {
    const key = `2026-10-${String(d).padStart(2, '0')}`
    meals[key] = {
      status,
      paid: status === STATUS.SCHOOL && paidDays.includes(Number(d)),
      note: d === '2' ? 'sándwich de pollo y fruta' : '',
    }
  }
  return meals
}

function FakeMeals({ children }) {
  const [meals] = useState(buildMeals)
  const value = {
    meals,
    price: PRICE,
    childName: 'Gisel',
    loading: false,
    syncing: false,
    error: null,
    retry: () => {},
    setDayDetail: async () => {},
    applyRange: async () => ({ ok: true, count: 0 }),
    markPaid: async () => true,
    markPaidRange: async () => ({ ok: true, count: 0 }),
    setPrice: async () => true,
    settleMonth: async () => ({ ok: true, count: 0 }),
    clearError: () => {},
  }
  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>
}

const FAKE_USER = { displayName: 'Gisel Mamá', email: 'mama@ejemplo.com', photoURL: null }

function Harness() {
  const { isDark } = useDarkMode()
  const [tab, setTab] = useState('dashboard')
  const [month, setMonth] = useState(() => startOfMonth(new Date()))

  return (
    <FakeMeals>
      <div className="flex h-dvh flex-col">
        <Header
          user={FAKE_USER}
          tab={tab}
          onTabChange={setTab}
          isDark={isDark}
          onToggleTheme={() => {}}
          onLogout={() => {}}
          onOpenSettings={() => {}}
        />
        <main className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-3 lg:max-w-5xl lg:px-6 xl:max-w-6xl 2xl:max-w-[1680px] shell-cap">
          <SyncStatus />
          <div key={tab} className="flex min-h-0 flex-1 flex-col animate-fade-in">
            {tab === 'dashboard' && <Dashboard month={month} onMonthChange={setMonth} />}
            {tab === 'report' && <Report month={month} onMonthChange={setMonth} />}
          </div>
        </main>
      </div>
    </FakeMeals>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <Harness />
    </ToastProvider>
  </StrictMode>,
)