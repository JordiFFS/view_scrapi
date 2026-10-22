# View Scrapi

Frontend web, pensado primero para el celular, que consulta la **TikTok Data API** (proyecto
`scrapy_tiktok`, hecho con FastAPI). Tiene dos pantallas:

- **Perfil:** escribe un usuario y muestra su perfil, sus videos recientes, las estadísticas y los comentarios.
- **Buscar por tema:** escribe un tema (ej. "uñas acrílicas") y muestra los mejores videos ordenados por puntaje.

La interfaz tiene estilo de **consola de scraping** (tema oscuro con acentos de neón) y muestra
no solo los resultados, sino **cómo se obtuvieron**: mientras se extrae se ve el recorrido de los
datos y un registro en vivo de cada petición a la API, y la vista **Datos** permite inspeccionar
el JSON recibido y cómo se transforma antes de graficarlo (ver [Cómo se trata la información](#cómo-se-trata-la-información)).

Dentro de un perfil, la vista **Análisis IA** muestra la personalidad estimada del creador y el
sentimiento de su audiencia, calculados por modelos de Hugging Face en el backend (ver
[Análisis con IA](#análisis-con-ia)).

Para conocer las herramientas que se usan y cómo está organizado el código, lee
[ESTRUCTURA.md](ESTRUCTURA.md).

---

## Requisitos

| Herramienta | Versión | Comprobar con |
|---|---|---|
| Node.js | 20.19 o superior, o 22.12 o superior (lo pide Vite 8) | `node -v` |
| npm | viene con Node.js | `npm -v` |
| TikTok Data API | encendida en `http://localhost:8000` | ver paso 1 |

## 1. Levantar la API

El frontend solo muestra datos: la extracción la hace la API. Desde la carpeta del proyecto
`scrapy_tiktok`:

```bash
python -m venv venv
source venv/bin/activate        # fish: source venv/bin/activate.fish · Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium     # solo la primera vez
python main.py
```

Comprueba que responde:

```bash
curl http://localhost:8000/api/salud
# {"estado":"ok"}
```

La API ya tiene CORS abierto (`allow_origins=["*"]`), así que no hace falta configurar nada
para que el navegador pueda llamarla.

## 2. Instalar el frontend

En esta carpeta (`view_scrapi`):

```bash
npm install
```

## 3. Configurar el `.env`

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

| Variable | Para qué sirve | Valor local |
|---|---|---|
| `VITE_API_URL` | URL base de la API, sin `/` al final | `http://localhost:8000` |

- Si la API corre en otra máquina o puerto (por ejemplo, para probar desde el celular en la
  misma red WiFi), pon aquí su IP, como `http://192.168.1.50:8000`.
- **Después de cambiar el `.env` hay que reiniciar `npm run dev`**: Vite solo lee las variables al arrancar.
- Todo lo que empieza con `VITE_` termina dentro del JavaScript que descarga el navegador.
  **Nunca pongas tokens ni contraseñas aquí.**
- `.env` está en `.gitignore`; el que se sube al repositorio es `.env.example`.

## 4. Ejecutar

```bash
npm run dev
```

Abre http://localhost:5173. La primera búsqueda de un perfil o tema tarda entre 1 y 3 minutos,
porque la API abre un navegador real. Mientras tanto la pantalla muestra si la solicitud está en
cola o extrayendo. Si repites la misma búsqueda, la respuesta sale de la caché de la API y llega en segundos.

### Verlo desde el celular

```bash
npm run dev -- --host
```

Vite mostrará una dirección `Network: http://192.168.x.x:5173`; ábrela en el celular (conectado
a la misma red). Recuerda que `VITE_API_URL` también debe usar la IP de la computadora, no `localhost`,
porque en el celular `localhost` apunta al propio celular.

## Cómo se trata la información

Todo lo que se muestra aquí es real (sale de las respuestas de la API y del navegador), no una
animación inventada.

| Dónde | Qué muestra |
|---|---|
| **Cabecera** | Estado de la API: llama a `GET /api/salud` al abrir la app y cada 30 s, y muestra la latencia en ms. Tócala para comprobar de nuevo. |
| **Formulario → "Ver la petición que se enviará"** | El método, la ruta y el JSON exacto que se enviará a `POST /api/extracciones`, actualizado mientras escribes. Se ve cómo los campos del formulario pasan a `snake_case`. |
| **Durante la extracción** | El **recorrido de los datos** (TikTok → Scraper → API → Navegador → Visualización) con la etapa actual encendida, y una **consola** con cada petición: el POST, los cambios de estado (en cola, extrayendo, completada) y el tamaño del JSON recibido. |
| **Vista "Datos"** (en Perfil y en Buscar) | Medidas del JSON (tamaño, campos, niveles de anidación, tiempo total, consultas), el recorrido con un dato real en cada etapa, el registro completo, la **transformación de un video** (el objeto anidado de la API frente a la fila plana que arma `filasDeVideos()`, con las columnas calculadas marcadas) y el **JSON completo** en un árbol plegable que se puede descargar. |

### Gráficos dinámicos

- **Indicadores y contadores del perfil:** el número "cuenta" hasta su valor al aparecer.
- **Barras (top de videos, días, hashtags, creadores):** crecen al aparecer y se reacomodan con
  animación al cambiar de métrica en el selector.
- **Evolución por fecha de publicación** (nuevo, recharts): área con las vistas, likes o tasa de
  interacción de cada video en el tiempo, con botones para cambiar de métrica, línea de la mediana
  y tooltip al pasar el dedo o el mouse.
- **¿Más vistas = más interacción?** (nuevo, recharts): dispersión con un punto por video (vistas
  en escala logarítmica, tasa de interacción y comentarios como tamaño) y la tasa general como referencia.
- **Análisis con IA:** el radar crece desde el centro con un brillo de neón y las barras de
  sentimiento y emociones se animan al aparecer.

Si el sistema tiene activado **"reducir movimiento"**, las animaciones se desactivan
(`motion-safe:` en Tailwind y `prefers-reduced-motion` en `useNumeroAnimado`).

## Análisis con IA

Después de cargar un perfil, abre la vista **Análisis IA** y toca **Analizar con IA**. El análisis
no se pide solo: el backend extrae los datos y ejecuta modelos de Hugging Face, y la primera vez
puede tardar varios minutos (mientras tanto se ve un contador de tiempo). Si lo repites, la
respuesta sale de la caché del backend en segundos. Marca **Ignorar caché** para recalcularlo.

Usa el endpoint `GET /api/analisis/{usuario}`, con los mismos parámetros que la búsqueda del perfil
(`max_videos`, `comentarios`, `max_comentarios`, `refrescar`). Todos los valores llegan entre 0 y 1
y se muestran como porcentaje (`0.62` → `62 %`).

### Qué muestra cada gráfico

| Gráfico | Datos de la API | Cómo leerlo |
|---|---|---|
| **Personalidad del creador (radar)** | `big5_creador` | Los cinco rasgos Big Five (apertura, responsabilidad, extraversión, amabilidad, neuroticismo), estimados a partir de las descripciones de sus videos. Cada eje va de 0 % (centro) a 100 % (borde); la forma muestra qué rasgos sobresalen. |
| **¿Qué significa cada rasgo?** | `big5_creador` | Versión en texto del radar: porcentaje, nivel (bajo ≤ 33 %, medio, alto ≥ 67 %), qué mide el rasgo y qué suele indicar ese nivel en el contenido. |
| **Sentimiento de los comentarios** | `comentarios.sentimiento` | Barras horizontales con la proporción de comentarios positivos (azul), neutrales (gris) y negativos (rojo). El eje va siempre de 0 % a 100 %. |
| **Emociones en los comentarios** | `comentarios.emociones` | Barras ordenadas de mayor a menor: alegría, tristeza, enojo, miedo, sorpresa y asco. "Otros" va al final en gris. |
| **Advertencia y nota metodológica** | `advertencia`, `nota`, `modelos` | Avisos del backend (por ejemplo, pocos textos) y qué modelo hizo cada tarea. Los resultados son una estimación a partir de textos cortos, no un diagnóstico. |

Si el perfil se buscó sin comentarios, los dos gráficos de la audiencia se reemplazan por un aviso.

### Flujo de datos

```
PanelAnalisis (botón "Analizar con IA")
   │  onAnalizar({ refrescar })
   ▼
PaginaPerfil ── guarda el usuario y las opciones de la última búsqueda
   │  analizar(usuario, opciones)
   ▼
useAnalisis ── guarda { analisis, cargando, error }
   │  obtenerAnalisis(usuario, opciones)
   ▼
api/analisis.js ── GET /api/analisis/{usuario} con timeout de 6 minutos
   │
   ▼
Backend FastAPI ── scraping + modelos de Hugging Face ── JSON con valores 0–1
```

Los componentes nunca usan axios: reciben el estado por props y avisan con `onAnalizar`.
Al buscar otro perfil, el análisis anterior se descarta.

### Nueva dependencia

| Paquete | Para qué |
|---|---|
| [`recharts`](https://recharts.org) 3.10 | Radar, barras, área y dispersión con tooltips y animaciones, en SVG y adaptables al ancho de la pantalla |

Para no hacer más lenta la primera carga en el celular, recharts se descarga aparte (`React.lazy`):
solo cuando aparecen los gráficos de Estadísticas o se abre la vista **Análisis IA**.

Las fuentes (Space Grotesk y JetBrains Mono) se cargan desde Google Fonts en `index.html`. Sin
internet, la app usa las fuentes del sistema.

Si ya tenías el proyecto instalado, instala la dependencia nueva:

```bash
npm install
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática en http://localhost:5173 |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve `dist/` en http://localhost:4173 para probar el build |

## Problemas comunes

| Mensaje en pantalla | Causa probable | Solución |
|---|---|---|
| "No se pudo conectar con la API…" | La API está apagada o `VITE_API_URL` es incorrecta | Revisa el paso 1 y el `.env`, y reinicia `npm run dev` |
| "No se encontraron videos para '…'" | TikTok está limitando las consultas | Espera unos minutos y vuelve a intentar |
| "No se encontró el perfil, es privado o TikTok bloqueó la solicitud." | El usuario no existe, es privado o TikTok lo bloqueó | Revisa el nombre de usuario o espera unos minutos |
| "Hay N extracciones en cola…" | La cola de la API está llena (máximo 10 pendientes) | Espera a que terminen las anteriores |
| "Extracción no encontrada…" | La API se reinició durante la búsqueda o pasaron más de 30 min | Vuelve a buscar |
| "La API tardó demasiado en responder…" al analizar | El análisis superó los 6 minutos (modelos descargándose la primera vez) | Revisa los logs del backend y vuelve a tocar **Analizar con IA** cuando los modelos ya estén descargados |
| La vista Análisis IA dice "No hubo comentarios para analizar" | El perfil se buscó sin "Incluir comentarios" o con 0 comentarios por video | Vuelve a buscar con comentarios activados |
