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
| [Recharts](https://recharts.org) | 3.10 | Gráficos del análisis con IA: radar de personalidad y barras de sentimiento y emociones (SVG, con tooltips y ancho adaptable). |

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
- **Gráficos: divs para barras simples, recharts para lo demás.** Las barras del panel de
  estadísticas (`GraficoBarras`) siguen hechas con divs: son simples y no pesan nada. Para el
  análisis con IA se agregó recharts, porque un radar a mano en SVG es mucho código y además da
  tooltips y ejes listos. Para que no haga más lenta la primera carga, recharts solo se descarga
  al abrir la vista "Análisis IA" (`React.lazy` en `PaginaPerfil`).
- **Tema "consola de scraping":** fondo oscuro con cuadrícula, paneles de vidrio y acentos de neón
  (rosado = marca, cian = datos/sistema, violeta = IA). Las piezas repetidas son utilidades propias
  en `src/index.css` (`panel`, `esquinas`, `etiqueta-hud`, `boton-neon`, `boton-borde`, `campo`),
  creadas con `@utility` de Tailwind 4. Fuentes: Space Grotesk y JetBrains Mono (Google Fonts).
- **Mostrar cómo se obtienen los datos:** `useExtraccion` guarda un `registro` de cada petición y unas
  `metricas` (tiempo, consultas, bytes). La consola, el recorrido de los datos y la vista "Datos" los
  muestran tal cual; no hay pasos inventados.
- **Animaciones con `motion-safe:`:** se apagan solas si el sistema pide reducir movimiento.
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
    ├── index.css         Tailwind + tema oscuro (fuentes, fondo), utilidades propias (panel, campo…) y animaciones
    │
    ├── api/              Capa de comunicación con la API (único lugar donde se usa axios)
    │   ├── client.js       Instancia de axios: URL base, timeout e interceptor de errores
    │   ├── tiktok.js       Una función por endpoint de extracción (perfil, búsqueda, extracciones)
    │   ├── analisis.js     obtenerAnalisis: GET /api/analisis/{usuario} con timeout de 6 min
    │   └── index.js
    │
    ├── hooks/            Estado de cada pantalla (carga, error, datos)
    │   ├── useExtraccion.js  Flujo genérico: POST + consultas periódicas hasta terminar, con registro y métricas
    │   ├── usePerfil.js      useExtraccion aplicado a perfiles
    │   ├── useBusqueda.js    useExtraccion aplicado a búsquedas por tema
    │   ├── useAnalisis.js    Una petición larga: { analisis, cargando, error, inicio, analizar, limpiar }
    │   ├── useSalud.js       Estado y latencia de GET /api/salud (cada 30 s) para la cabecera
    │   ├── useNumeroAnimado.js  Efecto contador para los números (no llama a la API)
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
    │   ├── GraficoBarras.jsx    Barras horizontales con divs, animadas al aparecer y al cambiar de datos
    │   ├── TablaVideos.jsx      Tabla ordenable con todas las métricas por video
    │   ├── SelectorVista.jsx    Control "Estadísticas / Videos / Análisis IA / Datos"
    │   ├── ResumenBusqueda.jsx  Consulta, totales y hashtags usados
    │   ├── Cargando.jsx         Animación de scraping (navegador, lupa, datos volando) + estado de la extracción
    │   ├── TextoRotativo.jsx    Frases que se turnan con una entrada suave (usado en las cargas)
    │   ├── MonitorExtraccion.jsx Carga + consola en vivo + recorrido de los datos
    │   ├── Introduccion.jsx     Encabezado de cada página con el formulario
    │   ├── IndicadorAPI.jsx     Píldora de estado de la API (cabecera)
    │   ├── VistaPreviaPeticion.jsx La petición HTTP exacta que enviará el formulario
    │   ├── NumeroAnimado.jsx    Número con efecto contador
    │   ├── MensajeError.jsx     Caja de error
    │   ├── index.js             Reexporta inspector/, pero no analisis/ ni graficos/ (se cargan con lazy)
    │   │
    │   ├── inspector/           Vista "Datos": cómo se obtiene y se transforma la información
    │   │   ├── InspectorDatos.jsx      Contenedor: medidas, recorrido, registro, transformación y JSON
    │   │   ├── PipelineDatos.jsx       TikTok → Scraper → API → Navegador → Visualización
    │   │   ├── ConsolaRegistro.jsx     Terminal con el registro de useExtraccion
    │   │   ├── TransformacionDatos.jsx Un video: JSON anidado → fila plana (filasDeVideos)
    │   │   ├── ArbolJSON.jsx           Visor de JSON plegable (recursivo, con <details>)
    │   │   └── index.js
    │   │
    │   ├── graficos/            Gráficos de recharts para Estadísticas (cargados con lazy)
    │   │   ├── GraficoEvolucion.jsx    Área: métrica por fecha de publicación, con selector y mediana
    │   │   ├── GraficoDispersion.jsx   Dispersión: vistas (log) vs. tasa de interacción
    │   │   ├── TooltipHUD.jsx          Tooltip común con estilo de visor
    │   │   ├── tema.js                 Colores (validados con la skill dataviz) y helpers de ejes
    │   │   └── index.js
    │   │
    │   └── analisis/            Análisis con IA de un perfil (usa recharts)
    │       ├── PanelAnalisis.jsx      Contenedor: botón "Analizar con IA", carga, error y resultados
    │       ├── CargandoIA.jsx         Espera del análisis: red neuronal animada, "La IA está pensando", tiempo
    │       ├── GraficoBig5.jsx        Radar con los 5 rasgos de personalidad
    │       ├── DescripcionRasgos.jsx  Explicación y nivel de cada rasgo (versión en texto del radar)
    │       ├── GraficoSentimiento.jsx Barras positivo / neutral / negativo
    │       ├── GraficoEmociones.jsx   Barras de emociones, de mayor a menor
    │       ├── NotaMetodologica.jsx   Advertencia, nota y modelos usados
    │       ├── BarrasPorcentaje.jsx   Base común de los dos gráficos de barras (recharts)
    │       ├── TooltipPorcentaje.jsx  Cuadro al pasar el mouse o tocar un dato
    │       ├── constantes.js          Nombres en español, descripciones de rasgos y colores
    │       └── index.js
    │
    └── utils/            Funciones sin estado
        ├── formato.js      formatearNumero (12500 -> "12,5 mil"), formatearPorcentaje (0.62 -> "62%" o "62 %") y formatearFecha (es-EC)
        ├── estadisticas.js Totales, promedios, medianas, tasa de interacción, hashtags, días, creadores
        ├── exportar.js     Descarga de CSV y JSON desde el navegador
        ├── inspeccion.js   Tamaño del JSON, estructura (campos, niveles), bytes y duraciones legibles
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
api/               tiktok.js, analisis.js ──► client.js ──► axios ──► API FastAPI
```

El análisis con IA sigue el mismo camino: `PanelAnalisis` (botón) → `PaginaPerfil` →
`useAnalisis` → `api/analisis.js` → `GET /api/analisis/{usuario}`. No usa extracciones: es una
sola petición larga, por eso `obtenerAnalisis` le da su propio timeout de 6 minutos en lugar de
los 4 minutos generales de `client.js`.

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
| Evolución (recharts) | Vistas, likes o interacción por fecha de publicación, con la mediana como referencia |
| Dispersión (recharts) | Vistas (escala log) vs. tasa de interacción; tamaño = comentarios |
| Hashtags | Los más usados y sus vistas promedio |
| Creadores | Solo en búsquedas: quién tiene más videos en el tema |
| Detalle por video | Tabla ordenable con todas las métricas |

**Exportar CSV** descarga una fila por video (`filasDeVideos`) con fecha, día, hora, hashtags,
métricas, interacciones, tasa y, en búsquedas, creador y puntajes. **Exportar JSON** descarga la
respuesta completa de la API. Son la base para el análisis de datos posterior (Excel, pandas, etc.).

## Vista "Datos" (inspector)

Muestra cómo se obtiene y se trata la información de la última consulta, con datos reales:

| Sección | De dónde sale |
|---|---|
| Medidas (tamaño, campos, niveles, tiempo, consultas) | `utils/inspeccion.js` sobre el JSON y `metricas` de `useExtraccion` |
| Recorrido de los datos | `PipelineDatos`, con un dato real por etapa (videos, consultas, KB, filas) |
| Registro | `registro` de `useExtraccion`: POST, cambios de estado, resultado o error |
| Transformación de un video | El primer video tal como llega frente a su fila de `filasDeVideos()` |
| JSON completo | `ArbolJSON`, plegable y descargable |

Mientras se extrae, `MonitorExtraccion` muestra el recorrido con la etapa activa y la consola en vivo.
Si la extracción falla, la consola queda visible debajo del error para ver en qué paso ocurrió.

## Análisis con IA

En un perfil, la tercera vista (**Análisis IA**) pide el análisis al backend solo cuando el usuario
toca el botón. `PaginaPerfil` guarda el usuario y las opciones de la última búsqueda y los reutiliza;
`refrescar` lo decide la casilla del panel. Al buscar otro perfil, `useAnalisis.limpiar()` descarta
el análisis anterior y cualquier petición en curso. Qué muestra cada gráfico está en el
[README](README.md#análisis-con-ia).

---

## Endpoints de la API

Las funciones están en `src/api/tiktok.js`, salvo el análisis con IA, que está en `src/api/analisis.js`:

| Método | Ruta | Función | ¿La usa la interfaz? |
|---|---|---|---|
| GET | `/api/salud` | `obtenerSalud()` | No (sirve para comprobar la conexión) |
| POST | `/api/extracciones` | `crearExtraccionPerfil()` / `crearExtraccionBusqueda()` | Sí |
| GET | `/api/extracciones/{id}` | `consultarExtraccion()` | Sí |
| GET | `/api/perfil/{usuario}` | `obtenerPerfil()` | No (versión directa, espera 1–3 min) |
| GET | `/api/busqueda?q=…` | `buscarVideos()` | No (versión directa, espera 1–3 min) |
| GET | `/api/analisis/{usuario}` | `obtenerAnalisis()` (en `analisis.js`) | Sí, vista "Análisis IA" (puede tardar varios minutos) |

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
con JSDoc y agrégalo a `components/index.js`. Si es parte de un grupo grande (como el análisis),
va en una subcarpeta con su propio `index.js`.

### Convenciones

- Nombres en español (`buscar`, `cargando`, `TarjetaVideo`), igual que en la API.
- Componentes en PascalCase con extensión `.jsx`; hooks con `use` y extensión `.js`.
- Exportaciones con nombre (`export function`), salvo `App`, que es `export default`.
- Todos los textos de la interfaz en español; números y fechas con `utils/formato.js` (es-EC).
- En recharts los colores van en hexadecimal (no entiende clases de Tailwind); están en
  `components/graficos/tema.js` (y `analisis/constantes.js` los reutiliza).
- Para una sección nueva, usa las utilidades del tema: `<section className="panel p-4">`,
  `<p className="etiqueta-hud">// título</p>`, `boton-neon`, `boton-borde`, `campo`.
