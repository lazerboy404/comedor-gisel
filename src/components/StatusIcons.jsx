import { forwardRef } from 'react'

/*
 * Iconos de estado COMPUESTOS.
 *
 * Lucide no trae un icono que combine casa + cubiertos, ni cubiertos + escuela,
 * ni una carita llorando. Se componen aquí a partir de las formas de lucide
 * (mismos trazos, mismas proporciones y mismo grosor relativo), en un viewBox
 * de 24x24 igual que el resto de los iconos, para que se mezclen sin cantar.
 *
 * Composición: símbolo principal arriba a la izquierda (a ~65%) y el secundario
 * abajo a la derecha (a ~52%), que es el patrón habitual de un icono combinado.
 * Como cada grupo va escalado, su strokeWidth se sube en la misma proporción
 * (2 / escala) para que el trazo se vea parejo y no más delgado.
 */

const BASE = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function makeIcon(displayName, render) {
  const Icon = forwardRef(function IconComponent({ className, strokeWidth = 2, ...props }, ref) {
    return (
      <svg ref={ref} {...BASE} strokeWidth={strokeWidth} className={className} {...props}>
        {render()}
      </svg>
    )
  })
  Icon.displayName = displayName
  return Icon
}

/* --- formas base de lucide (tomadas tal cual de v1.50) --- */

const HOUSE = (
  <>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </>
)

const UTENSILS = (
  <>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </>
)

const UTENSILS_CROSSED = (
  <>
    <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
    <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
    <path d="m2.1 21.8 6.4-6.3" />
    <path d="m19 5-7 7" />
  </>
)

const SCHOOL = (
  <>
    <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
    <path d="M18 4.933V21" />
    <path d="m4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6" />
    <path d="m6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11" />
    <path d="M6 4.933V21" />
    <circle cx="12" cy="9" r="2" />
  </>
)

/* --- iconos compuestos --- */

/** Comida de casa: casita + cubiertos (llevó comida de casa).
 *  Casa arriba a la izquierda y cubiertos abajo a la derecha, SIN tocarse:
 *  a tamaño real (14px) dos símbolos encimados se vuelven una mancha. */
export const HomeMeal = makeIcon('HomeMeal', () => (
  <>
    <g transform="translate(0.3 1.2) scale(0.62)" strokeWidth={3.2}>
      {HOUSE}
    </g>
    <g transform="translate(14 13) scale(0.42)" strokeWidth={4.8}>
      {UTENSILS}
    </g>
  </>
))

/** Comedor: cubiertos + escuela (come en el comedor de la escuela).
 *  La escuela es el símbolo que identifica el estado, así que lleva algo más
 *  de tamaño; los cubiertos la acompañan. */
export const SchoolMeal = makeIcon('SchoolMeal', () => (
  <>
    <g transform="translate(0 0.4) scale(0.44)" strokeWidth={4.5}>
      {UTENSILS_CROSSED}
    </g>
    <g transform="translate(10.6 10.2) scale(0.56)" strokeWidth={3.6}>
      {SCHOOL}
    </g>
  </>
))

/** Ausencia: carita llorando (lucide no la trae; se compone aquí) */
export const CryingFace = makeIcon('CryingFace', () => (
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M15 10V9" />
    <path d="M9 10V9" />
    {/* boca triste: arco hacia arriba (∩) */}
    <path d="M8 17q4-5 8 0" />
    {/* lágrima */}
    <path d="M19 12.4c.95 1.25 1.7 2.2 1.7 3.1a1.7 1.7 0 0 1-3.4 0c0-.9.75-1.85 1.7-3.1z" />
  </>
))