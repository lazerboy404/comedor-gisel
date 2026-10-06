import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const toast = useCallback((message, type = 'success') => {
    const id = (idRef.current += 1)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2800)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Viewport de notificaciones */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-toast-in flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-surface-50 dark:text-ink-900"
          >
            {t.type === 'error' ? (
              <CircleAlert className="size-4 shrink-0 text-rose-400 dark:text-rose-600" />
            ) : (
              <CircleCheck className="size-4 shrink-0 text-home-50 dark:text-home-600" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}