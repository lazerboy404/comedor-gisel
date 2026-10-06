import { createContext, useContext, useState } from 'react'
import { useMeals } from '../hooks/useMeals'

export const MealsContext = createContext(null)

export function MealsProvider({ uid, children }) {
  const [retryKey, setRetryKey] = useState(0)
  const meals = useMeals(uid, retryKey)
  const value = { ...meals, retry: () => setRetryKey((k) => k + 1) }
  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>
}

export const useMealsData = () => {
  const ctx = useContext(MealsContext)
  if (!ctx) throw new Error('useMealsData debe usarse dentro de <MealsProvider>')
  return ctx
}
