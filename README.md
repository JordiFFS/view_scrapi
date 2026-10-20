# View Scrapi

Frontend web, pensado primero para el celular, que consulta la **TikTok Data API** (proyecto
`scrapy_tiktok`, hecho con FastAPI). Tiene dos pantallas:

- **Perfil:** escribe un usuario y muestra su perfil, sus videos recientes, las estadísticas y los comentarios.
- **Buscar por tema:** escribe un tema (ej. "uñas acrílicas") y muestra los mejores videos ordenados por puntaje.

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
