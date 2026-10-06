import { useEffect, useState } from 'react'
import { LogOut, Moon, Settings2, Sun, UtensilsCrossed } from 'lucide-react'

/** Barra superior: título, ajustes (precio), modo claro/oscuro y menú del usuario */
export default function Header({ user, isDark, onToggleTheme, onLogout, onOpenSettings }) {
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
    <header className="z-40 border-b border-surface-200 bg-surface-100/80 backdrop-blur dark:border-white/10 dark:bg-night-950/80">
      <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between px-4 lg:max-w-5xl lg:px-6 xl:max-w-6xl">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-brand-400 text-white shadow-sm">
            <UtensilsCrossed className="size-4.5" />
          </div>
          <h1 className="text-base font-bold tracking-tight">Comedor Gisel</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Ajustes (precio por comida)"
            title="Ajustes"
            className="flex size-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-brand-300"
          >
            <Settings2 className="size-5" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="flex size-9 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-brand-300"
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menú de cuenta"
              aria-expanded={open}
              className="ml-0.5 size-9 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-brand-400/60"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex size-full items-center justify-center bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-400/20 dark:text-brand-200">
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
                <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-2xl border border-surface-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-night-900 animate-slide-up">
                  <div className="border-b border-surface-100 px-3 py-2.5 dark:border-white/10">
                    <p className="truncate text-sm font-semibold">{user?.displayName || 'Mi cuenta'}</p>
                    <p className="truncate text-xs text-ink-700 dark:text-white/45">{user?.email}</p>
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