# 🍽️ Comedor Gisel

PWA para llevar el **control exacto** de las comidas escolares y calcular los pagos: registra cada día en la nube (Firestore), sincroniza en tiempo real entre dispositivos, funciona **offline** y genera un reporte con las **fechas exactas** pendientes de pago — lista para "confrontar" a la administración escolar.

## Stack

- **React 19 + Vite 8** — frontend ultrarrápido
- **Tailwind CSS 4** — diseño minimalista, mobile-first, modo claro/oscuro
- **Firebase** — Authentication (Google) + Cloud Firestore con caché persistente
- **vite-plugin-pwa** — instalable como app, actualización automática
- **Lucide React** — iconografía
- Despliegue: **Vercel**

## Requisitos

- Node.js **≥ 22.12** (verifica con `node --version`)
- Una cuenta de Google (para crear el proyecto de Firebase)

## 1) Instalación local

```bash
npm install
```

## 2) Configurar Firebase (~10 minutos, solo la primera vez)

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto (p. ej. **comedor-gisel**). Puedes desactivar Analytics.

2. **Authentication**: en el menú lateral **Build > Authentication**, presiona *Get started*, selecciona el proveedor **Google**, actívalo, pon un correo de soporte y guarda.

3. **Firestore**: en **Build > Firestore Database**, presiona *Create database*. Elige la región (p. ej. `americas` / `nam5`) y **inicia en modo de producción** (las reglas del paso 5 lo dejan seguro).

4. **App web**: en ⚙️ **Project settings > Your apps > Web (`</>`)**, registra una app (apodo "Comedor Gisel", **sin** hosting). Copia el objeto `firebaseConfig` que te muestra.

5. **Reglas de seguridad**: en **Firestore Database > Rules**, pega lo siguiente y presiona *Publish*:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
         match /meals/{date} {
           allow read, write: if request.auth != null && request.auth.uid == uid;
         }
       }
     }
   }
   ```

   > Con estas reglas **nadie más** puede leer/escribir los datos de tu hija: solo la cuenta dueña del `uid`.

6. **Variables de entorno**: copia `.env.local.example` como `.env.local` en la raíz y pega los valores de tu `firebaseConfig`:

   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=comedor-gisel-xxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=comedor-gisel-xxxx
   VITE_FIREBASE_STORAGE_BUCKET=comedor-gisel-xxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcd...
   ```

7. Inicia la app: `npm run dev` → <http://localhost:5173>. Si ves la pantalla "Configuración pendiente", falta algún valor en `.env.local`.

## 3) Cómo se usa

- **Inicio (dashboard principal)**: **una sola pantalla sin scroll** — KPIs compactos arriba (total a pagar + días de comedor, comida de casa, ausencias, sin clases y días ya pagados) y el **calendario interactivo** que se expande para llenar el espacio; al marcar un día, el total se actualiza al instante. Incluye el botón de **liquidar ciclo**. El **precio por comida** se ajusta en el engranaje del encabezado.
- **Calendario** (dentro de Inicio): al tocar/clic un día se abren sus opciones:
  - **Comida de casa** (verde pino) — llevó comida de casa ($0)
  - **Comedor** (ocre) — comió en la escuela (suma al pago)
  - **Ausencia** (rojo ladrillo) — no aplica
  - **Sin clases** (pizarra, con borde discontinuo) — festivo o suspensión
  - **Sin marca** — limpia el día
  - En el mismo panel puedes escribir una **nota opcional** (qué llevó de comer) y, si es día de comedor, marcarlo como **ya pagado**.
- **Rangos de días**: arrastra sobre varios días (o mantén presionado y desliza) para aplicar el mismo estado a toda una semana de corrido; los fines de semana se ignoran y se conservan notas e historial de pagos.
- **Inicio**: tarjetas con "Días de comedor", "Días con casa", "Ausencias" y **Total a pagar** del mes, más el input de **precio por comida** (se guarda en Firestore y se sincroniza).
- **Liquidar ciclo**: cuando pagues el mes, confirma el modal; los días pasan a `paid: true` y dejan de sumar, **conservando el historial** (`paidAt`).
- **Marcar días pagados individualmente**: botón ✓ de cada fila del **Reporte**, o el interruptor "Ya lo pagaste" en el **detalle del día** (mantén presionado en el calendario) — útil si la escuela cobra por día/semana y no por mes completo.
- **Reporte**: la lista exacta de fechas **no pagadas** en el comedor, con botón para **copiar el resumen** y enviarlo a la escuela.

## 4) Desplegar en Vercel

1. Sube el proyecto a GitHub (repo privado recomendado). `.env.local` **nunca se sube** (está en `.gitignore`):

   ```bash
   git init
   git add .
   git commit -m "Comedor Gisel"
   # crea el repo en github.com y luego:
   git remote add origin https://github.com/TU-USUARIO/comedor-gisel.git
   git push -u origin main
   ```

2. En [vercel.com](https://vercel.com): **Add New > Project > Import** tu repo. Vercel detecta Vite automáticamente (build: `npm run build`, output: `dist`).

3. Antes del primer deploy, en **Settings > Environment Variables** agrega las **6 variables** `VITE_FIREBASE_*` con los mismos valores de `.env.local` (entorno *Production*).

4. Deploy. Obtendrás `https://tu-proyecto.vercel.app`.

5. **IMPORTANTE**: ve a Firebase Console > **Authentication > Settings > Authorized domains > Add domain** y agrega `tu-proyecto.vercel.app` (sin `https://`). Sin esto, Google bloqueará el login en producción.

6. **Instalar como app**:
   - Android (Chrome): menú ⋮ > *"Instalar aplicación"*
   - iPhone (Safari): botón Compartir > *"Agregar a inicio"*

## Estructura del proyecto

```
├── index.html                  # Metadatos PWA + tema antes de cargar
├── vite.config.js              # React + Tailwind v4 + PWA (manifest + SW)
├── vercel.json                 # SPA rewrites
├── .env.local.example          # Plantilla de credenciales
└── src/
    ├── lib/
    │   ├── firebase.js         # Init con VITE_FIREBASE_* + caché offline
    │   ├── dates.js            # Matriz del calendario y formatos es-MX
    │   ├── meals.js            # Lógica de negocio (estados, stats, reporte)
    │   ├── format.js           # Moneda MXN
    │   └── clipboard.js        # Copiar con respaldo
    ├── context/
    │   ├── AuthContext.jsx     # useAuth: sesión Google
    │   ├── MealsContext.jsx    # useMealsData: datos en tiempo real
    │   └── ToastContext.jsx    # Notificaciones
    ├── hooks/
    │   ├── useMeals.js         # Firestore: onSnapshot + escrituras optimistas
    │   ├── useDarkMode.js      # Claro/oscuro persistente
    │   └── useOnlineStatus.js  # Detección de conexión
    └── components/
        ├── AppShell.jsx        # Layout + navegación por pestañas
        ├── LoginScreen.jsx     # "Iniciar sesión con Google"
        ├── SetupScreen.jsx     # Guía si falta .env.local
        ├── Dashboard.jsx       # KPIs + calendario juntos (página principal)
        ├── SummaryCards.jsx    # Tarjetas KPI calculadas dinámicamente
        ├── SettleCycle.jsx     # Confirmación de liquidación (batch)
        ├── MonthCalendar.jsx   # Calendario mensual interactivo
        ├── DayCell.jsx         # Día: ciclo casa → comedor → ausencia
        ├── Report.jsx          # Modo confrontación + copiar
        └── …                   # Header, BottomNav, Modal, SyncStatus, Loaders
```

## Esquema de datos (Firestore)

```
users/{uid}
  precioComida: number        // precio por comida en el comedor
  childName: string           // "Gisel"
  createdAt: timestamp

  meals/{YYYY-MM-DD}          // un documento por día
    status: "home" | "school" | "absent" | "noclass"
    note: string               // opcional — qué llevó de comer
    paid: boolean              // true tras "Liquidar ciclo" o marcar el día
    updatedAt: timestamp
    paidAt: timestamp | null   // historial de liquidación
```

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Build de producción (`dist/`) |
| `npm run preview` | Previsualizar el build |
| `npm run lint` | Calidad de código |
| `npm run icons` | Regenerar íconos PWA desde `public/logo.svg` |

## Notas de diseño

- **Paleta calmada**: un solo color por estado (los mismos tonos en las tarjetas y en el calendario): verde pino para comida de casa, ocre para comedor, rojo ladrillo para ausencia y pizarra para sin clases. El pago se indica con el ícono de billete, no cambiando el color del día. Modo claro y oscuro con contrastes verificados ≥ 4.5:1.
- **Actualizaciones optimistas**: al tocar un día, la UI cambia al instante; Firestore sincroniza en segundo plano (si no hay internet, los cambios se guardan en el dispositivo y se suben solos al reconectar — verás el aviso "Guardando cambios en la nube…").
- **Multi-dispositivo**: inicia sesión con la misma cuenta de Google en cualquier dispositivo y verás los mismos datos en tiempo real.
- **Privacidad**: las reglas de Firestore restringen todo a tu cuenta.
