import { useEffect, useState } from 'react'
import { ClipboardList, LayoutDashboard, LogOut, Moon, Settings2, Sun, UtensilsCrossed } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'report', label: 'Reporte', icon: ClipboardList },
]

/** Barra superior: título, ajustes (precio), modo claro/oscuro y menú del usuario */
export default function Header({ user, tab, onTabChange, isDark, onToggleTheme, onLogout, onOpenSettings }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const initial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <header className="relative z-40 border-b border-surface-200 bg-surface-100/80 backdrop-blur dark:border-night-700 dark:bg-night-950/80">
      <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between px-4 lg:max-w-5xl lg:px-6 xl:max-w-6xl 2xl:max-w-[1680px] shell-cap">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-brand-400 text-white shadow-sm dark:bg-lima-400 dark:text-lima-ink dark:shadow-[0_6px_16px_-8px_rgba(199,224,122,0.5)]">
            <UtensilsCrossed className="size-4.5" />
          </div>
          <h1 className="hidden text-base font-bold tracking-tight sm:inline">Comedor Gisel</h1>
        </div>

        {/* Conmutador de vista: centrado al medio del header */}
        <nav
          aria-label="Cambiar de vista"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-200 bg-white/95 p-1 shadow-sm dark:border-night-700 dark:bg-night-900/95"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={active ? 'page' : undefined}
                title={label}
                aria-label={label}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm sm:px-3 font-semibold transition-all active:scale-95 ${
                  active
                    ? 'bg-brand-400 text-white dark:bg-lima-400 dark:text-lima-ink'
                    : 'text-ink-700 hover:bg-brand-100 hover:text-brand-700 dark:text-nightink-400 dark:hover:bg-night-800 dark:hover:text-nightink-100'
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Ajustes (precio por comida)"
            title="Ajustes"
            className="flex size-9 items-center justify-center rounded-full border border-transparent text-ink-700 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-nightink-400 dark:hover:bg-night-800 dark:hover:text-lima-300"
          >
            <Settings2 className="size-5" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="flex size-9 items-center justify-center rounded-full border border-transparent text-ink-700 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-nightink-400 dark:hover:bg-night-800 dark:hover:text-lima-300"
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menú de cuenta"
              aria-expanded={open}
              className="ml-0.5 size-9 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-brand-400/60 dark:hover:ring-lima-400/60"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex size-full items-center justify-center bg-brand-100 text-sm font-bold text-brand-700 dark:bg-lima-400/15 dark:text-lima-300">
                  {initial}
                </span>
              )}
            </button>

            {open && (
              <>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  tabIndex={-1}
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl border border-surface-200 bg-white p-2 shadow-lg dark:border-night-700 dark:bg-night-900 animate-slide-up">
                  <div className="border-b border-surface-100 px-3 py-2.5 dark:border-night-700">
                    <p className="truncate text-sm font-semibold">{user?.displayName || 'Mi cuenta'}</p>
                    <p className="truncate text-xs text-ink-700 dark:text-nightink-500">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onLogout()
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-rose-500 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10"
                  >
                    <LogOut className="size-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
