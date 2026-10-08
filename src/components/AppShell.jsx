import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { MealsProvider } from '../context/MealsContext'
import { useDarkMode } from '../hooks/useDarkMode'
import { startOfMonth } from '../lib/dates'
import Header from './Header'
import SyncStatus from './SyncStatus'
import Dashboard from './Dashboard'
import Report from './Report'
import PriceConfig from './PriceConfig'
import Modal from './Modal'

/** Layout de pantalla completa: header / contenido sin scroll / navegación */
export default function AppShell() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useDarkMode()
  const [tab, setTab] = useState('dashboard')
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <MealsProvider uid={user.uid}>
      <div className="flex h-dvh flex-col">
        <Header
          user={user}
          tab={tab}
          onTabChange={setTab}
          isDark={isDark}
          onToggleTheme={toggle}
          onLogout={logout}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-3 lg:max-w-5xl lg:px-6 xl:max-w-6xl 2xl:max-w-[1680px] shell-cap">
          <SyncStatus />
          <div key={tab} className="flex min-h-0 flex-1 flex-col animate-fade-in">
            {tab === 'dashboard' && <Dashboard month={month} onMonthChange={setMonth} />}
            {tab === 'report' && <Report month={month} onMonthChange={setMonth} />}
          </div>
        </main>


        <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Ajustes">
          <PriceConfig embedded />
        </Modal>
      </div>
    </MealsProvider>
  )
}
