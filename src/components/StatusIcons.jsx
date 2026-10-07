/*
 * Iconos de estado propios (los que lucide no trae).
 *
 * Lucide no tiene una carita llorando, así que se dibuja aquí con las mismas
 * formas y el mismo viewBox de 24x24 del resto de los iconos, para que se
 * mezcle sin cantar.
 *
 * Nota: las otras composiciones (casa+cubiertos, cubiertos+escuela) se
 * probaron y NO funcionaban a 14px, el tamaño real en la celda del calendario:
 * dos símbolos no caben legibles y se volvían una mancha. Por eso "Comida de
 * casa" usa el icono `Home` de lucide y "Comedor" usa `UtensilsCrossed`, que
 * se leen perfecto solos. No reintentar la composición sin probarla antes a
 * tamaño real.
 */

const BASE = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

/** Ausencia: carita llorando */
export function CryingFace({ className, strokeWidth = 2, ...props }) {
  return (
    <svg {...BASE} strokeWidth={strokeWidth} className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M15 10V9" />
      <path d="M9 10V9" />
      {/* boca triste: arco hacia arriba (∩) */}
      <path d="M8 17q4-5 8 0" />
      {/* lágrima */}
      <path d="M19 12.4c.95 1.25 1.7 2.2 1.7 3.1a1.7 1.7 0 0 1-3.4 0c0-.9.75-1.85 1.7-3.1z" />
    </svg>
  )
}