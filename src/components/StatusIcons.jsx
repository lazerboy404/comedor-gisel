/*
 * Iconos de estado COMPUESTOS.
 *
 * Lucide no trae casa+cubiertos, ni cubiertos+escuela, ni una carita llorando,
 * así que se componen aquí con las mismas formas de lucide.
 *
 * REGLA DE ORO (aprendida a golpes): a 14px, el tamaño real del icono en la
 * celda del calendario, dos símbolos NO caben dentro de un cuadrado de 24x24:
 * cada uno queda a ~7px y se vuelven una mancha. La solución es un icono
 * ANCHO: el viewBox se estira a 42x22 y los dos símbolos van lado a lado, cada
 * uno con el alto completo. Así conservan tamaño y se leen.
 *
 * Los trazos se escalan con strokeWidth = 2 / escala, para que el grosor se vea
 * parejo entre símbolos (el <g> escala también el trazo).
 *
 * IMPORTANTE al usarlos: el icono ya no es cuadrado, así que fijar SOLO el alto
 * (`h-3.5 w-auto`), no `size-3.5`, o se deforma.
 */

const BASE = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

/* --- formas base de lucide (v1.50), en su viewBox original de 24x24 --- */

const HOUSE = (
  <>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
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

/* --- helpers --- */

const SCALE = 0.86
const SW = 2 / SCALE // trazo parejo tras escalar

/** Símbolo dentro de su ranura del icono ancho */
const Slot = ({ x, y, children }) => (
  <g transform={`translate(${x} ${y}) scale(${SCALE})`} strokeWidth={SW}>
    {children}
  </g>
)

function makeIcon(displayName, viewBox, render) {
  const Icon = function IconComponent({ className, strokeWidth = 2, ...props }) {
    return (
      <svg {...BASE} viewBox={viewBox} strokeWidth={strokeWidth} className={className} {...props}>
        {render()}
      </svg>
    )
  }
  Icon.displayName = displayName
  return Icon
}

/* --- iconos --- */

/**
 * Comida de casa: casita + cubiertos cruzados, lado a lado.
 * Los cubiertos son los MISMOS que los del comedor (cruzados), que es lo que
 * se veía bien; antes se habían puesto los verticales y quedaban feos.
 */
export const HomeMeal = makeIcon('HomeMeal', '0 0 42 22', () => (
  <>
    <Slot x={-0.6} y={0.95}>
      {HOUSE}
    </Slot>
    <Slot x={20.4} y={0.77}>
      {UTENSILS_CROSSED}
    </Slot>
  </>
))

/** Comedor: cubiertos cruzados + escuela, lado a lado */
export const SchoolMeal = makeIcon('SchoolMeal', '0 0 42 22', () => (
  <>
    <Slot x={-0.4} y={0.77}>
      {UTENSILS_CROSSED}
    </Slot>
    <Slot x={19.4} y={0.72}>
      {SCHOOL}
    </Slot>
  </>
))

/** Ausencia: carita llorando (lucide no la trae; se compone aquí) */
export const CryingFace = makeIcon('CryingFace', '0 0 24 24', () => (
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