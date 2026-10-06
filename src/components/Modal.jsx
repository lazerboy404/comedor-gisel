import { useEffect } from 'react'

/** Modal móvil-first (bottom sheet en pantallas chicas, centrado en desktop) */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center animate-fade-in"
    >
      <button type="button" aria-label="Cerrar" tabIndex={-1} className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[82dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-night-900 animate-slide-up">
        {title && <h3 className="mb-3 pr-6 text-lg font-bold tracking-tight">{title}</h3>}
        {children}
      </div>
    </div>
  )
}