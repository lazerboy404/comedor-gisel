const pad = (n) => String(n).padStart(2, '0')

/** Fecha local -> 'YYYY-MM-DD' (clave del documento en Firestore) */
export const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** 'YYYY-MM-DD' -> Fecha local (sin sorpresas de zona horaria) */
export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Fecha -> 'YYYY-MM' */
export const monthKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

/** 'YYYY-MM-DD' -> 'YYYY-MM' */
export const monthKeyOfKey = (dateKey) => dateKey.slice(0, 7)

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1)

export const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1)

export const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

export const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6

/** Claves 'YYYY-MM-DD' de los días hábiles (L-V) entre dos claves, inclusive */
export function weekdaysBetween(fromKeyStr, toKeyStr) {
  const a = fromKeyStr < toKeyStr ? fromKeyStr : toKeyStr
  const b = fromKeyStr < toKeyStr ? toKeyStr : fromKeyStr
  const out = []
  let d = fromKey(a)
  const end = fromKey(b)
  while (d <= end) {
    if (!isWeekend(d)) out.push(toKey(d))
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  }
  return out
}

export const isToday = (date) => toKey(date) === toKey(new Date())

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * Matriz del mes (semanas que inician en lunes).
 * Cada celda es una fecha del mes o null (relleno de otra semana).
 */
export function monthMatrix(date) {
  const first = startOfMonth(date)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(first.getFullYear(), first.getMonth(), d))
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** 'Octubre 2026' */
export const monthTitle = (date) => {
  const s = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** 'Martes, 14 de octubre de 2026' */
export const formatLongDate = (dateKey) => {
  const s = fromKey(dateKey).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** 'mar, 14 oct' */
export const formatShortDate = (dateKey) =>
  fromKey(dateKey).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
