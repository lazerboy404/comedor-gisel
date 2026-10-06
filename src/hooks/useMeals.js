import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { monthKeyOfKey, weekdaysBetween } from '../lib/dates.js'
import { STATUS } from '../lib/meals.js'
import { useToast } from '../context/ToastContext'

/**
 * Toda la lógica de Firestore para comidas y configuración del usuario,
 * separada de la UI. Escrituras optimistas + sincronización en tiempo real.
 */
export function useMeals(uid, retryKey = 0) {
  const [meals, setMeals] = useState({})
  const [price, setPriceState] = useState(0)
  const [childName, setChildName] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false) // hay escrituras pendientes de sincronizar
  const [error, setError] = useState(null)
  const mealsRef = useRef(meals)
  const toast = useToast()
  const errorToastedRef = useRef(false)

  // Registra un error: lo expone a la UI y notifica UNA vez por episodio
  const reportError = useCallback(
    (err, context) => {
      console.error(`[useMeals] ${context}:`, err)
      setError(err)
      if (!errorToastedRef.current) {
        errorToastedRef.current = true
        const code = err?.code
        const msg =
          code === 'failed-precondition'
            ? 'No se puede guardar: crea Firestore en tu proyecto de Firebase (ver aviso arriba).'
            : code === 'permission-denied'
              ? 'No se puede guardar: publica las reglas de seguridad de Firestore (ver aviso arriba).'
              : 'No se pudo guardar en la nube. Revisa tu conexión.'
        toast(msg, 'error')
      }
    },
    [toast],
  )

  useEffect(() => {
    mealsRef.current = meals
  }, [meals])

  useEffect(() => {
    if (!uid || !db) return undefined
    setLoading(true)

    // Documento de configuración del usuario (precio, nombre)
    const unsubscribeUser = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          setPriceState(typeof data.precioComida === 'number' ? data.precioComida : 0)
          if (typeof data.childName === 'string' && data.childName) setChildName(data.childName)
        }
        setSyncing(snap.metadata.hasPendingWrites)
      },
      (err) => console.warn('[useMeals] Config:', err),
    )

    // Subcolección meals (tiempo real, cacheada offline)
    const unsubscribeMeals = onSnapshot(
      collection(db, 'users', uid, 'meals'),
      (snap) => {
        const map = {}
        snap.forEach((d) => {
          map[d.id] = d.data()
        })
        setMeals(map)
        setSyncing(snap.metadata.hasPendingWrites)
        setLoading(false)
        setError(null)
      },
      (err) => {
        reportError(err, 'Listener')
        setLoading(false)
      },
    )

    return () => {
      unsubscribeUser()
      unsubscribeMeals()
    }
  }, [uid, retryKey, reportError])

  /**
   * Guarda el detalle completo de un día desde el modal:
   * estado elegido + nota opcional (qué llevó de comer) + paid opcional.
   * status === null limpia el día (elimina documento y nota).
   */
  const setDayDetail = useCallback(
    async (dateKey, { status, note, paid }) => {
      if (!uid || !db) return
      const cleanNote = typeof note === 'string' ? note.trim() : ''
      const existing = mealsRef.current[dateKey] ?? {}
      const newPaid = typeof paid === 'boolean' ? paid : (existing.paid ?? false)
      // Actualización optimista
      setMeals((prev) => {
        const next = { ...prev }
        if (status === null) {
          delete next[dateKey]
        } else {
          next[dateKey] = {
            ...next[dateKey],
            status,
            paid: newPaid,
            note: cleanNote || null,
          }
        }
        return next
      })
      try {
        const ref = doc(db, 'users', uid, 'meals', dateKey)
        if (status === null) {
          await deleteDoc(ref)
        } else {
          await setDoc(
            ref,
            {
              status,
              updatedAt: serverTimestamp(),
              paid: newPaid,
              ...(cleanNote ? { note: cleanNote } : { note: deleteField() }),
              // paidAt: se registra la primera vez que se marca pagado; se borra al desmarcar
              ...(newPaid ? (existing.paid ? {} : { paidAt: serverTimestamp() }) : { paidAt: deleteField() }),
            },
            { merge: true },
          )
        }
      } catch (err) {
        reportError(err, 'setDayDetail')
      }
    },
    [uid, reportError],
  )

  /**
   * Aplica un estado a un RANGO de días hábiles (L-V) de corrido.
   * status === null limpia todo el rango. Batch atómico.
   */
  const applyRange = useCallback(
    async (fromKeyStr, toKeyStr, { status }) => {
      if (!uid || !db) return { ok: false, count: 0 }
      const keys = weekdaysBetween(fromKeyStr, toKeyStr)
      if (keys.length === 0) return { ok: true, count: 0 }
      // Actualización optimista
      setMeals((prev) => {
        const next = { ...prev }
        keys.forEach((k) => {
          if (status === null) {
            delete next[k]
          } else {
            next[k] = { ...next[k], status, paid: next[k]?.paid ?? false }
          }
        })
        return next
      })
      try {
        const batch = writeBatch(db)
        keys.forEach((k) => {
          const ref = doc(db, 'users', uid, 'meals', k)
          if (status === null) {
            batch.delete(ref)
          } else {
            // merge: conserva notas y el historial de pagos de cada día
            batch.set(ref, { status, updatedAt: serverTimestamp() }, { merge: true })
          }
        })
        await batch.commit()
        return { ok: true, count: keys.length }
      } catch (err) {
        reportError(err, 'applyRange')
        return { ok: false, count: keys.length }
      }
    },
    [uid, reportError],
  )

  /**
   * Marca/desmarca un día existente como pagado (acción rápida
   * desde el reporte). Solo aplica a días de comedor.
   */
  const markPaid = useCallback(
    async (dateKey, paid) => {
      if (!uid || !db) return false
      const existing = mealsRef.current[dateKey]
      if (!existing || existing.status !== STATUS.SCHOOL) return false
      // Actualización optimista
      setMeals((prev) =>
        prev[dateKey] ? { ...prev, [dateKey]: { ...prev[dateKey], paid } } : prev,
      )
      try {
        await setDoc(
          doc(db, 'users', uid, 'meals', dateKey),
          {
            paid,
            ...(paid ? (existing.paid ? {} : { paidAt: serverTimestamp() }) : { paidAt: deleteField() }),
          },
          { merge: true },
        )
        return true
      } catch (err) {
        reportError(err, 'markPaid')
        return false
      }
    },
    [uid, reportError],
  )

  /** Guarda el precio por comida (Firestore + optimista) */
  const setPrice = useCallback(
    async (value) => {
      if (!uid || !db) return false
      const n = Math.max(0, Number(value) || 0)
      setPriceState(n)
      try {
        await setDoc(doc(db, 'users', uid), { precioComida: n }, { merge: true })
        return true
      } catch (err) {
        reportError(err, 'setPrice')
        return false
      }
    },
    [uid, reportError],
  )

  /**
   * Marca/desmarca como pagados los días de COMEDOR dentro de un rango de
   * días hábiles (L-V). No toca el estado ni los días no-comedor. Batch atómico.
   */
  const markPaidRange = useCallback(
    async (fromKeyStr, toKeyStr, paid) => {
      if (!uid || !db) return { ok: false, count: 0 }
      const keys = weekdaysBetween(fromKeyStr, toKeyStr).filter(
        (k) => mealsRef.current[k]?.status === STATUS.SCHOOL,
      )
      if (keys.length === 0) return { ok: true, count: 0 }
      // Actualización optimista
      setMeals((prev) => {
        const next = { ...prev }
        keys.forEach((k) => {
          next[k] = { ...next[k], paid }
        })
        return next
      })
      try {
        const batch = writeBatch(db)
        keys.forEach((k) => {
          const existing = mealsRef.current[k] ?? {}
          batch.set(
            doc(db, 'users', uid, 'meals', k),
            {
              paid,
              ...(paid ? (existing.paid ? {} : { paidAt: serverTimestamp() }) : { paidAt: deleteField() }),
            },
            { merge: true },
          )
        })
        await batch.commit()
        return { ok: true, count: keys.length }
      } catch (err) {
        reportError(err, 'markPaidRange')
        return { ok: false, count: keys.length }
      }
    },
    [uid, reportError],
  )

  /**
   * Liquidar ciclo: marca todos los días de comedor NO pagados del mes
   * como paid: true (batch atómico). Dejan de sumar al total, historial intacto.
   */
  const settleMonth = useCallback(
    async (monthKeyStr) => {
      if (!uid || !db) return { ok: false, count: 0 }
      const pending = Object.keys(mealsRef.current)
        .filter(
          (k) => monthKeyOfKey(k) === monthKeyStr && mealsRef.current[k]?.status === STATUS.SCHOOL && !mealsRef.current[k]?.paid,
        )
        .sort()
      if (pending.length === 0) return { ok: true, count: 0 }
      // Actualización optimista
      setMeals((prev) => {
        const next = { ...prev }
        pending.forEach((k) => {
          next[k] = { ...next[k], paid: true }
        })
        return next
      })
      try {
        const batch = writeBatch(db)
        pending.forEach((k) => {
          batch.update(doc(db, 'users', uid, 'meals', k), { paid: true, paidAt: serverTimestamp() })
        })
        await batch.commit()
        return { ok: true, count: pending.length }
      } catch (err) {
        reportError(err, 'settleMonth')
        return { ok: false, count: pending.length, error: err }
      }
    },
    [uid, reportError],
  )

  const clearError = useCallback(() => {
    errorToastedRef.current = false
    setError(null)
  }, [])

  return useMemo(
    () => ({
      meals,
      price,
      childName,
      loading,
      syncing,
      error,
      setDayDetail,
      applyRange,
      markPaid,
      markPaidRange,
      setPrice,
      settleMonth,
      clearError,
    }),
    [meals, price, childName, loading, syncing, error, setDayDetail, applyRange, markPaid, markPaidRange, setPrice, settleMonth, clearError],
  )
}
