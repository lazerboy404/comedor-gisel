import { formatLongDate, monthKeyOfKey } from './dates.js'
import { formatMoney } from './format.js'

export const STATUS = {
  HOME: 'home', // Llevó comida de casa ($0)
  SCHOOL: 'school', // Comió en el comedor (suma al total)
  ABSENT: 'absent', // Ausencia de la niña
  NO_CLASS: 'noclass', // No hubo clases (festivo / suspensión)
}

export const STATUS_META = {
  [STATUS.HOME]: { label: 'Comida de casa' },
  [STATUS.SCHOOL]: { label: 'Comedor escolar' },
  [STATUS.ABSENT]: { label: 'Ausencia' },
  [STATUS.NO_CLASS]: { label: 'No hubo clases' },
}

/** Estadísticas de un mes a partir del mapa de comidas */
export function computeMonthStats(meals, monthKeyStr, price) {
  let schoolPending = 0
  let schoolPaid = 0
  let home = 0
  let absent = 0
  let noClass = 0
  for (const key of Object.keys(meals)) {
    if (monthKeyOfKey(key) !== monthKeyStr) continue
    const meal = meals[key]
    if (!meal?.status) continue
    if (meal.status === STATUS.SCHOOL) {
      if (meal.paid) schoolPaid += 1
      else schoolPending += 1
    } else if (meal.status === STATUS.HOME) {
      home += 1
    } else if (meal.status === STATUS.ABSENT) {
      absent += 1
    } else if (meal.status === STATUS.NO_CLASS) {
      noClass += 1
    }
  }
  return {
    schoolPending,
    schoolPaid,
    home,
    absent,
    noClass,
    pendingTotal: schoolPending * price,
    paidTotal: schoolPaid * price,
  }
}

/** Fechas (ordenadas) de días de comedor aún no pagados en un mes */
export function pendingDaysOfMonth(meals, monthKeyStr) {
  return Object.keys(meals)
    .filter((k) => monthKeyOfKey(k) === monthKeyStr && meals[k]?.status === STATUS.SCHOOL && !meals[k]?.paid)
    .sort()
}

/** Fechas (ordenadas) de días de comedor ya marcados como pagados en un mes */
export function paidDaysOfMonth(meals, monthKeyStr) {
  return Object.keys(meals)
    .filter((k) => monthKeyOfKey(k) === monthKeyStr && meals[k]?.status === STATUS.SCHOOL && meals[k]?.paid)
    .sort()
}

/** Texto plano listo para enviar a la escuela en caso de discrepancias */
export function buildReportText({ childName, monthName, days, price }) {
  const lines = days.map((key, i) => `${i + 1}. ${formatLongDate(key)} — ${formatMoney(price)}`)
  return [
    `Comedor escolar — ${monthName}`,
    `${childName} comió en el comedor ${days.length} ${days.length === 1 ? 'día' : 'días'} (pendientes de pago):`,
    '',
    ...lines,
    '',
    `Total a pagar: ${formatMoney(days.length * price)}`,
    `Precio por comida: ${formatMoney(price)}`,
  ].join('\n')
}