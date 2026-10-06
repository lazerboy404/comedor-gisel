import { ClipboardList, LayoutDashboard } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'report', label: 'Reporte', icon: ClipboardList },
]

/** Navegación inferior integrada al layout (no tapa el contenido) */
export default function BottomNav({ tab, onChange }) {
  return (
    <nav
      aria-label="Navegación principal"
      className="flex shrink-0 justify-center px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.625rem)]"
    >
      <div className="flex gap-1 rounded-full border border-surface-200 bg-white/95 p-1.5 shadow-lg dark:border-white/10 dark:bg-night-900/95">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                active
                  ? 'bg-brand-400 text-white shadow'
                  : 'text-ink-700 hover:bg-brand-100 hover:text-brand-700 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-brand-200'
              }`}
            >
              <Icon className="size-4.5" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}