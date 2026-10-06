Rediseño de paleta (2026-10-06): el usuario pidió deshacerse de la paleta pastel "cute", tener algo profesional/amigable/elegante, y luego rellenos SÓLIDOS no traslúcidos.

Sistema: **neutros fríos tipo grafito + índigo de marca + estados en tonos joya, con relleno sólido opaco**.
- Tokens semánticos en `src/index.css` @theme: `surface` (neutros fríos), `ink` (texto), `brand` (índigo #5b54e8/#4f46e5), `home` (esmeralda), `school` (ámbar), `absent` (ROJO), `noclass` (pizarra), `night` (oscuro). Los nombres viejos (cream/blush/mint/peach/lilac/fog) no existen.
- **Celdas del calendario**: relleno sólido opaco + **texto blanco**. Nada de tintes `*-50` ni de barras de acento ni de transparencias `*-400/12`. La traslucidez se eliminó por completo (pedido explícito del usuario).
- Rellenos por estado (verificados con texto blanco): `home-500 #047857` 5.48:1 · `school-500 #b45309` 5.02:1 (pagado: `school-700 #7c2d12` 9.37:1) · `absent-600 #dc2626` 4.83:1 · `noclass-600 #475569` 7.58:1.
- **Ausencia es ROJO** (antes violeta), pedido explícito del usuario.
- **"Sin clases"**: relleno pizarra sólido + **borde discontinuo** (dashed), se distingue por forma además de color.
- **Etiquetas**: "Casa"/"En casa" → **"Comida de casa"** (StatusPicker, SummaryCards, leyenda del calendario).
- **Día pagado**: ícono `Banknote` de lucide en círculo blanco (antes palomita; antes emoji 💵). Los 4 indicadores de SummaryCards y las tarjetas del Report también son sólidos.

Verificación (determinista, no visión): sondeo con Puppeteer leyendo `getComputedStyle` → los 5 elementos (total + 4 indicadores) y las 4 celdas devuelven `rgb()` SIN canal alfa (opacos), idénticos en claro y oscuro; total índigo `#4f46e5`. Auditoría de layout: 0 de 57 combinaciones con problemas, 0 textos < 4.5:1. Build y lint limpios.

Notas de entorno: el server de dev debe levantarse con `npx vite --port 5199 --strictPort` porque el banco de pruebas apunta al 5199. Vite enlaza solo IPv6 (`[::1]`), así que los scripts deben usar `http://localhost:5199/...` y NO `127.0.0.1`. `devtools/audit.mjs` acepta `AUDIT_URL`. La visión dio falsos negativos: las mediciones geométricas/getComputedStyle de Chrome headless son la fuente confiable.

## Comedor Gisel — jerarquía visual y paleta calmada

Ajuste de jerarquía visual y paleta calmada (2026-10-06, tras el rediseño). El usuario reportó: "no resalta mucho el calendario y las tarjetas sí; el calendario se pierde" + "usa una paleta más cómoda a los ojos, que no duela verla".

**Diagnóstico**: el problema no era el color, era la JERARQUÍA. Las 5 tarjetas KPI eran bloques saturados arriba y el calendario repetía el mismo peso saturado, así que competían y ganaba el que estaba primero.

**Solución (invertir jerarquía)**:
- **Tarjetas KPI = resumen**: fondo SUAVE (croma 0.02-0.09) con `*-100` en claro y `*-950` en oscuro, texto `*-800/600`; el color del estado va solo en ícono, número y borde. Se compactaron: `.kpi-strip` 88px → 76px (62px en pantallas bajas).
- **Calendario = protagonista**: único elemento con relleno SATURADO (croma 0.23-0.41). Marco con `shadow-md` + `ring-1 ring-surface-100` (lo levanta del fondo blanco), encabezado de semana con borde inferior y `font-bold uppercase`. Filas más altas: `--cal-row` 1.875rem → 2.25rem móvil, 2.875 → 3.25rem escritorio.
- Medido en Chrome: el calendario ocupa **4.0x-5.8x el área de las tarjetas**; es el único con relleno saturado.

**Paleta calmada** (bajo croma, todos ≥4.5:1 con blanco): marca índigo `brand-500 #4c4bbf` (6.85:1) · casa verde pino `home-500 #35705f` (5.78:1) · comedor ocre `school-500 #7d6214` (5.79:1) · ausencia rojo ladrillo `absent-500 #a33a3a` (6.51:1) · sin clases pizarra `noclass-600 #4b5563` (7.56:1). ΔE mínimo entre estados 27.7 claro / 28.2 oscuro.
- Cada familia tiene ahora 50/100/200/300/400/500/600/700/800/900/950 (`950` = fondo de tarjeta en oscuro).
- El estado NO depende solo del color: cada celda lleva su ícono (Home/UtensilsCrossed/CalendarX2/CalendarOff) y "Sin clases" conserva borde discontinuo.
- Contraste texto/fondo de tarjetas en oscuro: 8.1-14.3:1.

Verificación: auditoría 0 de 57 combinaciones con problemas, 0 textos < 4.5:1, build y lint limpios. Los tonos anteriores saturados (`home-500 #047857`, `school-500 #b45309`, `absent-600 #dc2626`, `brand-500 #4f46e5`) quedaron reemplazados por los calmados.

## Comedor Gisel — un color por estado y modo oscuro aclarado

Corrección de monotonía y modo oscuro (2026-10-06, después de la paleta calmada). El usuario reportó: "me confunde visualmente, siento que hay más colores; las tarjetas deben ser del mismo color que las marcas del calendario; el modo oscuro está muy oscuro a la vista".

**Causa raíz del exceso de color**: cada estado aparecía en DOS tonos distintos — la tarjeta tenía su propio tinte suave (`*-100` claro / `*-950` oscuro) y la celda del calendario el sólido (`*-500`) — así que el ojo contaba 8 colores donde hay 4.

**Solución — un solo color por estado**: la tarjeta usa EXACTAMENTE la misma clase de relleno que la celda del calendario. `bg-home-500` / `bg-school-500` / `bg-absent-500` / `bg-noclass-600` en tarjeta y celda. Ya no hay tintes suaves `*-100`/`*-950` en las tarjetas. Texto blanco sobre el relleno: 5.78-7.56:1.
- Verificado en Chrome (getComputedStyle): **4/4 estados con el mismo valor rgb exacto en tarjeta y calendario, en claro Y en oscuro.**

**Modo oscuro aclarado** (`--color-night-*` en `src/index.css`): antes eran casi negro. Ahora azul-grafito más luminoso — `night-950 #172033` (antes `#0b1220`, L 0.006 → 0.0145) · `night-900 #1f2a3c` · `night-800 #283449` · `night-700 #33425a`. El texto claro conserva 13.8:1 sobre el fondo.

**Otras notas de esta ronda**: la tarjeta "Total a pagar" pasó por una versión de superficie neutra + barra de acento y luego volvió a relleno sólido índigo `brand-500 #4c4bbf` para quedar consistente con el resto.

PITFALL confirmado (importante): NO hacer dos `editLocalFile` sobre el MISMO archivo dentro del mismo bloque paralelo — la segunda escritura pisa a la primera y la primera reporta "success" igualmente. Se detectó porque el grep seguía mostrando los valores viejos. Editar un archivo a la vez, y verificar el valor aplicado con grep después.

Verificación final: auditoría 0 de 57 combinaciones, celdas en oscuro 5.78-7.56:1, build y lint limpios.

## Comedor Gisel — día pagado conserva su color

Día pagado conserva su color (2026-10-06). El usuario pidió: "que el día que ya está pagado no cambie de color a más oscuro, porque para eso es el billete; que conserve el color que debe llevar".

**Cambio**: en `DayCell.jsx` se eliminó la rama que oscurecía el día de comedor pagado (`bg-school-700`). Ahora un día de comedor pagado y uno sin pagar usan EXACTAMENTE el mismo relleno `bg-school-500`; lo único que distingue el pago es el ícono `Banknote` blanco en la esquina superior derecha.
- Verificado en Chrome: los 14 días de comedor del mes dan UN solo color `rgb(125,98,20)`, con billete o sin él, en claro y en oscuro.
- La leyenda del calendario ("Pagado") también se actualizó: muestra el billete blanco en círculo, no el punto ocre oscuro. Requirió importar `Banknote` en `MonthCalendar.jsx`.

REGLA: el estado del día se comunica SOLO con el color de su relleno; el pago se comunica SOLO con el billete. No usar variantes de tono para señalar el pago en el calendario.

NOTA DE MEDICIÓN (importante): `devtools/audit.mjs` puede reportar 1 falso positivo de contraste cuando captura la tarjeta "Total a pagar" a mitad de su `animate-fade-in` (arranca en opacidad 0 → lee 1:1). Si aparece un 1 de 57 con contrastes absurdos tipo 1:1 en textos que sí se ven bien, re-correr el audit antes de tocar código. 2 de 3 corridas dieron 0 de 57.

## Comedor Gisel — columna izquierda pareja con el calendario

Columna izquierda pareja con el calendario (2026-10-06). El usuario reportó: "me molesta que quede un hueco debajo de las KPIs; me gustaría que estuviera lleno y parejo a la altura del calendario".

**Medición del defecto**: en escritorio el hueco bajo el último bloque izquierdo era de 205px (1024x768), 237px (1280x800) y 337px (1440x900). La causa: la rejilla `.dashboard-grid` tenía `grid-template-rows: auto auto auto minmax(0,1fr)` con una fila fantasma `'.  cal'`, así que la columna izquierda se quedaba con su altura natural y el resto sobraba.

**Solución**:
- `.dashboard-grid` ahora usa `grid-template-rows: auto minmax(0,1fr) auto` y áreas `'nav cal' / 'cards cal' / 'settle cal'`. La fila de KPIs es la que estira.
- `.kpi-strip` en escritorio: `height: 100%` + `grid-template-rows: auto minmax(0,1fr) minmax(0,1fr)` → el total con su alto natural y los 4 indicadores repartiéndose el resto en dos filas iguales.
- El número y el ícono escalan con la altura del viewport vía clases `.kpi-num` / `.kpi-icon` (número 36px; 48px a >=900px de alto; 60px a >=1050px). Sin esto, en pantallas grandes las tarjetas quedaban vacías por dentro.
- OJO: puse un `max-height: 480px` a `.kpi-strip` y eso reabrió un hueco INTERNO de 59-371px entre las KPIs y el botón de liquidar. Se quitó. NO usar tope de altura ahí.

**Resultado verificado** (medido con getBoundingClientRect): hueco final 0px y hueco entre KPIs y botón de 10px (el gap de rejilla) en 1024x768, 1280x800, 1366x768, 1440x900 y 1920x1080. Móvil intacto: `.kpi-strip` 62px en pantallas bajas y 76px en las normales, número 20px, sin scroll de página.

Auditoría 0 de 57 combinaciones, build y lint limpios.

## Comedor Gisel — KPI de días pagados

KPI de días pagados (2026-10-06). El usuario pidió: "falta una KPI de cuántos días ya están pagados con el billete".

**Cambio**: en `SummaryCards.jsx` se agregó una sexta tarjeta **"Pagados"** que muestra `stats.schoolPaid` (días de comedor marcados como pagados). Va a lo ancho, abajo de todo, justo encima del botón de liquidar.
- **Color**: usa el MISMO ocre `bg-school-500` que la tarjeta Comedor y que la celda del calendario. Es deliberado: un día pagado es un día de comedor, y así no entra un sexto color a la pantalla (el usuario se quejó antes de que hubiera demasiados colores).
- **Distinción**: el ícono es un `Banknote` en círculo blanco, igual que la marca de la celda del calendario. Verificado: Pagados y Comedor dan el mismo rgb en claro y en oscuro; lo único que cambia es el billete.
- Rejilla móvil: `grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))]` (6 en fila). Escritorio: `lg:grid-cols-2`, total `col-span-2`, y Pagados también `col-span-2`.
- `.kpi-strip` en escritorio pasó a `grid-template-rows: auto minmax(0,1fr) minmax(0,1fr) auto` (total / 4 estados en dos filas / pagados a lo ancho). El hueco final sigue en 0px en 1024x768, 1280x800, 1366x768, 1440x900 y 1920x1080.

**Verificado**: la KPI muestra 4 y el calendario tiene exactamente 4 días de comedor con billete — coinciden. Móvil 6 tarjetas sin scroll (a 320px el ancho mínimo es 39px, apretado pero pasa la auditoría). Auditoría 0 de 57 combinaciones, build y lint limpios.
