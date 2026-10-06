import { useEffect, useState } from 'react'

const STORAGE_KEY = 'comedor-theme'

/** Modo claro/oscuro con persistencia y respeto a la preferencia del sistema */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'dark') return true
      if (saved === 'light') return false
    } catch {
      /* sin localStorage */
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
    } catch {
      /* sin localStorage */
    }
  }, [isDark])

  return { isDark, toggle: () => setIsDark((d) => !d) }
}
