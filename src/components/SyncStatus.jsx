import { CloudOff, RefreshCw, TriangleAlert } from 'lucide-react'
import { useMealsData } from '../context/MealsContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

/** Estado de conexión: banner sin internet + aviso de escrituras pendientes + errores */
export default function SyncStatus() {
  const online = useOnlineStatus()
  const { syncing, error, retry } = useMealsData()

  return (
    <>
      {!online && (
        <div
          role="status"
          className="mb-3 flex shrink-0 items-center gap-2 rounded-xl bg-amber-100 px-3 py-2.5 text-sm font-medium text-amber-800 dark:bg-amber-400/15 dark:text-amber-200"
        >
          <CloudOff className="size-4 shrink-0" />
          Sin conexión. Los cambios se guardan en el dispositivo y se sincronizan solos.
        </div>
      )}

      {online && syncing && (
        <div
          role="status"
          className="mb-3 flex shrink-0 items-center gap-2 rounded-xl bg-brand-100 px-3 py-2 text-xs font-medium text-brand-700 dark:bg-brand-400/30 dark:text-brand-200"
        >
          <RefreshCw className="size-3.5 shrink-0 animate-spin" />
          Guardando cambios en la nube…
        </div>
      )}

      {error && (
        <FirestoreError error={error} onRetry={retry} />
      )}
    </>
  )
}

/** Convierte el error de Firestore en una instrucción concreta */
function FirestoreError({ error, onRetry }) {
  const code = error?.code
  let title = 'No se pudo sincronizar con la nube.'
  let detail = 'Revisa tu conexión; los datos locales están a salvo en este dispositivo.'

  if (code === 'failed-precondition') {
    title = 'Firestore aún no está creado en tu proyecto.'
    detail =
      'Consola de Firebase > Build > Firestore Database > Create database. Luego publica las reglas de seguridad (README, sección 2, pasos 3 y 5).'
  } else if (code === 'permission-denied') {
    title = 'Permisos insuficientes: faltan las reglas de seguridad.'
    detail = 'Pega y publica las reglas del README en: Firestore Database > Rules (sección 2, paso 5).'
  }

  return (
    <div
      role="alert"
      className="mb-3 flex shrink-0 items-start gap-2 rounded-xl bg-rose-100 px-3 py-2.5 text-sm text-rose-800 dark:bg-rose-400/15 dark:text-rose-200"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-90">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex shrink-0 items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition-transform active:scale-95"
      >
        <RefreshCw className="size-3.5" />
        Reintentar
      </button>
    </div>
  )
}