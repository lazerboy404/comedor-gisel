# Informe de auditoría de layout — Comedor Gisel

Fecha: 2026-10-06
Método: banco de pruebas que monta los componentes reales con datos falsos
(`devtools/audit.html`) medido con Chrome headless (`devtools/audit.mjs`).
El dashboard real vive detrás del login de Google, que no se puede automatizar.

## Cobertura

57 combinaciones de ventana:
- Anchos: 280, 320, 360, 375, 390, 414, 480, 540, 640, 768, 820, 900,
  1024, 1100, 1280, 1440, 1600, 1920, 2560 px
- Altos: 800 (normal), 480 (bajo), 400 (horizontal / ventana aplastada)

En cada una se midió: desborde horizontal, elementos recortados por su
contenedor, celdas del calendario encimadas, elementos tapados por el
encabezado o la barra de navegación, texto menor a 9px, y contraste real
de cada texto (WCAG, con composición de fondos y opacidades).

## Resultado

**0 de 57 combinaciones con problemas.** Las celdas del calendario nunca
bajan de 30px de alto (móvil) ni de 46px (escritorio), y siempre muestran
su número y su emoji completos.

## Defectos encontrados y corregidos

1. **Contraste del botón principal (grave).** El rosa de marca `#F58FBB`
   con texto blanco daba **2.20:1**, muy por debajo del 4.5:1 mínimo.
   Afectaba el botón "Liquidar ciclo", los botones de los modales, el
   elemento activo de la navegación y los iconos. La escala `blush` se
   rehízo: `blush-400` pasó a `#CE3B78` (**4.64:1** con blanco).
   `blush-300` (#F58FBB) se conserva como acento decorativo donde no
   lleva texto encima.

2. **Celdas aplastadas en pantallas bajas.** Con 560px de alto las celdas
   caían a 22px y recortaban el número y el emoji. Se fijó un piso de
   fila con la variable CSS `--cal-row` (30px móvil / 46px escritorio),
   compartida entre la retícula y la celda para que no se desincronicen.

3. **El botón de liquidar quedaba bajo la barra de navegación** en
   pantallas bajas (375x560: pedía 567px y había 560). Se compactó la
   fila de KPIs por debajo de 700px de alto (88px -> 72px) y se oculta la
   leyenda de colores del calendario en esa misma franja.

4. **`theme_color` del manifest** seguía en el verde viejo (`#059669`).
   Ahora es el rosa de marca.

## Comprobaciones visuales

Capturas reales de Chrome en `devtools/shots/` a 8 tamaños, en claro y
oscuro. En 375x560 el botón "Liquidar" se ve completo por encima del nav;
en 1280x800 el dashboard queda en dos columnas equilibradas sin espacios
muertos.

## Nota sobre el límite de la vista

El navegador embebido de Perch Desktop devuelve coordenadas fuera de
pantalla en esta sesión, así que las capturas se tomaron con Chrome
headless sobre el banco de pruebas, no sobre la app logueada.