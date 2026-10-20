# Herramientas y estructura del proyecto

Este documento explica **con qué** está hecho View Scrapi y **cómo** está organizado el código.
Para instalarlo y ejecutarlo, ve al [README](README.md).

---

## Herramientas

### Dependencias de la aplicación

| Herramienta | Versión | Para qué se usa |
|---|---|---|
| [React](https://react.dev) | 19.3 | Construir la interfaz con componentes y manejar el estado con hooks (`useState`, `useEffect`, `useCallback`, `useRef`). |
| [React DOM](https://react.dev/reference/react-dom) | 19.3 | Mostrar los componentes de React en el navegador (`createRoot` en `main.jsx`). |
| [Axios](https://axios-http.com) | 1.20 | Hacer las peticiones HTTP a la API. Se usa una sola instancia con URL base, timeout y un interceptor que traduce los errores. |

### Herramientas de desarrollo

| Herramienta | Versión | Para qué se usa |
|---|---|---|
| [Vite](https://vite.dev) | 8.3 | Servidor de desarrollo con recarga instantánea y empaquetado para producción. También lee el `.env`. |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | 6.1 | Permite a Vite entender JSX y conservar el estado de React al recargar (Fast Refresh). |
| [Tailwind CSS](https://tailwindcss.com) | 4.3 | Estilos con clases utilitarias directamente en el JSX (`rounded-xl`, `bg-pink-600`…). |
| [@tailwindcss/vite](https://tailwindcss.com/docs/installation/using-vite) | 4.3 | Plugin oficial que integra Tailwind 4 con Vite. Gracias a él no hacen falta `tailwind.config.js` ni `postcss.config.js`. |

### Decisiones tomadas

- **JavaScript sin TypeScript:** se buscaba algo simple. Los tipos importantes están documentados
  con comentarios JSDoc (`@param`, `@returns`), que el editor también usa para autocompletar.
- **Sin router:** solo hay dos pantallas, así que basta con un estado `pestana` en `App.jsx`.
- **Sin Redux ni React Query:** cada pantalla tiene su propio hook con `useState`. Para una app de
  este tamaño no hace falta un estado global ni una caché del lado del cliente (la API ya tiene la suya).
- **Sin librerías de UI:** todos los componentes son propios y usan Tailwind.
- **Mobile-first:** las clases sin prefijo son para el celular; `sm:` y `lg:` agregan columnas en
  pantallas más anchas. Se usa `min-h-dvh` para que la altura sea correcta en navegadores móviles.

---

## Estructura de carpetas

```
view_scrapi/
├── .env                  Variables de entorno locales (no se sube a git)
├── .env.example          Plantilla del .env
├── index.html            HTML base: tiene el <div id="root"> y carga src/main.jsx
├── vite.config.js        Plugins de Vite: React + Tailwind
├── package.json          Dependencias y scripts (dev, build, preview)
├── README.md             Cómo instalar y ejecutar
├── ESTRUCTURA.md         Este documento
└── src/
    ├── main.jsx          Punto de entrada: monta <App /> en el navegador
    ├── App.jsx           Cabecera con pestañas y las dos páginas
    ├── index.css         Solo @import "tailwindcss"
    │
    ├── api/              Capa de comunicación con la API (único lugar donde se usa axios)
    │   ├── client.js       Instancia de axios: URL base, timeout e interceptor de errores
    │   ├── tiktok.js       Una función por endpoint
    │   └── index.js
    │
    ├── hooks/            Estado de cada pantalla (carga, error, datos)
    │   ├── useExtraccion.js  Flujo genérico: POST + consultas periódicas hasta terminar
    │   ├── usePerfil.js      useExtraccion aplicado a perfiles
    │   ├── useBusqueda.js    useExtraccion aplicado a búsquedas por tema
    │   └── index.js
    │
    ├── pages/            Pantallas completas: unen un hook con los componentes
    │   ├── PaginaPerfil.jsx
    │   ├── PaginaBusqueda.jsx
    │   └── index.js
    │
    ├── components/       Piezas visuales: reciben datos por props, no llaman a la API
    │   ├── BuscadorPerfil.jsx   Formulario de usuario + opciones (videos, comentarios)
    │   ├── BuscadorTema.jsx     Formulario de tema + cantidad de videos
    │   ├── CampoNumero.jsx      Campo numérico con rango (cantidad de videos/comentarios)
    │   ├── TarjetaPerfil.jsx    Avatar, nombre, bio y contadores
    │   ├── ListaVideos.jsx      Cuadrícula de videos del perfil
    │   ├── ListaResultados.jsx  Cuadrícula de resultados de búsqueda
    │   ├── TarjetaVideo.jsx     Un video con estadísticas y comentarios desplegables
    │   ├── InfoResultado.jsx    Creador y puntaje de un resultado de búsqueda
    │   ├── PanelEstadisticas.jsx Dashboard: indicadores, hallazgos, gráficos, tabla y exportación
    │   ├── GraficoBarras.jsx    Gráfico de barras horizontales hecho con divs
    │   ├── TablaVideos.jsx      Tabla ordenable con todas las métricas por video
    │   ├── SelectorVista.jsx    Control "Estadísticas / Videos"
    │   ├── ResumenBusqueda.jsx  Consulta, totales y hashtags usados
    │   ├── Cargando.jsx         Spinner con el estado de la extracción
    │   ├── MensajeError.jsx     Caja de error
    │   └── index.js
    │
    └── utils/            Funciones sin estado
        ├── formato.js      formatearNumero (12500 -> "12,5 mil"), formatearPorcentaje y formatearFecha (es-EC)
        ├── estadisticas.js Totales, promedios, medianas, tasa de interacción, hashtags, días, creadores
        ├── exportar.js     Descarga de CSV y JSON desde el navegador
        └── index.js
```

Cada carpeta tiene un `index.js` que reexporta su contenido. Así las importaciones quedan cortas:

```js
import { usePerfil } from "../hooks";            // en vez de "../hooks/usePerfil"
import { TarjetaVideo, Cargando } from "../components";
```

---

## Cómo se conectan las capas

Las dependencias van en un solo sentido: cada capa solo usa a las que están debajo.

```
App.jsx            elige qué página se ve
   │
pages/             PaginaPerfil, PaginaBusqueda
   │      │
   │      └──────► components/   (solo reciben props)
   │                    │
hooks/                  └──► utils/
   │
api/               tiktok.js ──► client.js ──► axios ──► API FastAPI
```

Reglas:

- **Solo `api/` importa axios.** Si cambia la URL de un endpoint, se corrige en un único archivo.
- **Los componentes no hacen peticiones.** Reciben datos y funciones (`onBuscar`) por props, así
  que se pueden reutilizar y probar por separado.
- **Los hooks guardan el estado** (`datos`, `cargando`, `error`, `progreso`) y las páginas
  deciden qué mostrar según ese estado.

---

## Flujo de una búsqueda

La API tarda de 1 a 3 minutos en extraer datos de TikTok. Esperar todo ese tiempo con una petición
abierta funciona mal en el celular (si la conexión se corta, se pierde todo). Por eso la app usa
las **extracciones asíncronas** de la API:

```
Usuario          PaginaPerfil        useExtraccion                  API
   │  "Buscar"        │                     │                         │
   ├─────────────────►│  buscar(usuario)    │                         │
   │                  ├────────────────────►│  POST /api/extracciones │
   │                  │                     ├────────────────────────►│
   │                  │                     │◄──── 202 { id, estado: "pendiente" }
   │   "En cola…"     │◄── progreso ────────┤                         │
   │                  │                     │  espera N segundos      │
   │                  │                     │  GET /api/extracciones/{id}
   │                  │                     ├────────────────────────►│
   │ "Extrayendo…"    │◄── progreso ────────┤◄──── { estado: "en_proceso" }
   │                  │                     │      … se repite …      │
   │                  │                     │◄──── { estado: "completada", resultado }
   │  perfil + videos │◄── datos ───────────┤                         │
```

- **Cada cuánto se consulta:** lo indica la API en `consultar_de_nuevo_en_seg`. Si no viene, se usan 3 segundos.
- **Si falla:** el estado es `error` y se muestra `error.detalle`.
- **Límite de espera:** a los 10 minutos se deja de consultar y se muestra un error.
- **Nueva búsqueda o pantalla cerrada:** la búsqueda anterior se cancela, para que su resultado no
  aparezca tarde encima de la nueva.
- **Cambio de pestaña:** las dos páginas se quedan cargadas (solo se ocultan), así que la búsqueda
  sigue y los resultados se conservan.

### Manejo de errores

`api/client.js` tiene un interceptor que convierte cualquier error de axios en un `Error` con un
mensaje en español:

| Caso | Mensaje |
|---|---|
| La API devolvió `{ "detail": "texto" }` | Ese mismo texto |
| Error de validación de FastAPI (422) | Los mensajes de la validación, unidos en uno |
| Sin respuesta (API apagada, URL incorrecta) | "No se pudo conectar con la API…" |
| Timeout | "La API tardó demasiado en responder…" |
| Otro 404 / 5xx | Mensaje genérico según el código |

Así los hooks solo necesitan hacer `setError(err.message)`.

---

## Panel de estadísticas

Al terminar una consulta (perfil o tema) se muestra primero la vista **Estadísticas**; la vista
**Videos** tiene las tarjetas de siempre. Todo se calcula en el navegador con `utils/estadisticas.js`
a partir de `video.estadisticas`, sin peticiones extra.

| Sección | Qué muestra |
|---|---|
| Indicadores | Total, promedio y mediana de vistas, likes, comentarios, compartidos y guardados |
| Tasa de interacción | (likes + comentarios + compartidos + guardados) / vistas |
| Hallazgos | Frases automáticas: video más visto vs. mediana, mejor y peor día, mejor hashtag, videos bajo la tasa general, videos sin hashtags |
| Top videos | Ranking por la métrica elegida (incluye tasa de interacción) |
| Por día | Vistas promedio según el día de publicación |
| Hashtags | Los más usados y sus vistas promedio |
| Creadores | Solo en búsquedas: quién tiene más videos en el tema |
| Detalle por video | Tabla ordenable con todas las métricas |

**Exportar CSV** descarga una fila por video (`filasDeVideos`) con fecha, día, hora, hashtags,
métricas, interacciones, tasa y, en búsquedas, creador y puntajes. **Exportar JSON** descarga la
respuesta completa de la API. Son la base para el análisis de datos posterior (Excel, pandas, etc.).

---

## Endpoints de la API

Todas las funciones están en `src/api/tiktok.js`:

| Método | Ruta | Función | ¿La usa la interfaz? |
|---|---|---|---|
| GET | `/api/salud` | `obtenerSalud()` | No (sirve para comprobar la conexión) |
| POST | `/api/extracciones` | `crearExtraccionPerfil()` / `crearExtraccionBusqueda()` | Sí |
| GET | `/api/extracciones/{id}` | `consultarExtraccion()` | Sí |
| GET | `/api/perfil/{usuario}` | `obtenerPerfil()` | No (versión directa, espera 1–3 min) |
| GET | `/api/busqueda?q=…` | `buscarVideos()` | No (versión directa, espera 1–3 min) |

Las opciones se escriben en camelCase en JavaScript (`maxVideos`) y la función las convierte al
snake_case de la API (`max_videos`). Si una opción se deja sin valor, no se envía y la API usa
su valor por defecto.

---

## Cómo agregar algo nuevo

**Un endpoint nuevo:** agrega una función en `src/api/tiktok.js` que use `client`, con su JSDoc.
`api/index.js` la exporta automáticamente gracias a `export *`.

**Una pantalla nueva:**
1. Si usa extracciones, crea un hook como `useBusqueda.js` que llame a `useExtraccion`. Si no,
   uno propio con `useState`.
2. Crea `src/pages/PaginaNueva.jsx` y exporta la página en `pages/index.js`.
3. Agrega la pestaña en `PESTANAS` y su bloque `<div hidden={…}>` en `App.jsx`.

**Un componente nuevo:** créalo en `src/components/`, recibe todo por props, documenta las props
con JSDoc y agrégalo a `components/index.js`.

### Convenciones

- Nombres en español (`buscar`, `cargando`, `TarjetaVideo`), igual que en la API.
- Componentes en PascalCase con extensión `.jsx`; hooks con `use` y extensión `.js`.
- Exportaciones con nombre (`export function`), salvo `App`, que es `export default`.
- Todos los textos de la interfaz en español; números y fechas con `utils/formato.js` (es-EC).
