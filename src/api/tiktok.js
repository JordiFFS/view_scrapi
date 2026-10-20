/**
 * Funciones para cada endpoint de la API de TikTok (proyecto scrapy_tiktok).
 *
 * Cada función hace una sola petición y devuelve `data` (el JSON de la respuesta).
 * Los componentes nunca usan axios directamente: llaman a estas funciones a través de los hooks.
 *
 * Endpoints disponibles:
 *   GET  /api/salud                 -> obtenerSalud
 *   GET  /api/perfil/{usuario}      -> obtenerPerfil          (directo, tarda 1–3 min)
 *   GET  /api/busqueda?q=...        -> buscarVideos           (directo, tarda 1–3 min)
 *   POST /api/extracciones          -> crearExtraccionPerfil / crearExtraccionBusqueda
 *   GET  /api/extracciones/{id}     -> consultarExtraccion
 *
 * La interfaz usa el flujo de extracciones (POST + consultas con GET), que responde
 * al instante y permite mostrar el progreso. Las llamadas directas quedan disponibles.
 *
 * Las opciones que se dejan en `undefined` no se envían y la API usa sus valores por defecto.
 */
import { client } from "./client";

/**
 * Comprueba que la API esté encendida.
 * @returns {Promise<{ estado: "ok" }>}
 */
export async function obtenerSalud() {
  const { data } = await client.get("/api/salud");
  return data;
}

/**
 * Obtiene el perfil y sus videos esperando a que termine la extracción (llamada directa).
 *
 * @param {string} usuario Con o sin "@".
 * @param {object} [opciones]
 * @param {number} [opciones.maxVideos] Posts recientes a extraer (1–30, por defecto 10).
 * @param {boolean} [opciones.comentarios] Incluir comentarios (por defecto true).
 * @param {number} [opciones.maxComentarios] Comentarios por post (0–100, por defecto 20).
 * @param {boolean} [opciones.refrescar] Ignorar la caché de la API.
 */
export async function obtenerPerfil(
  usuario,
  { maxVideos, comentarios, maxComentarios, refrescar } = {},
) {
  const limpio = usuario.trim().replace(/^@/, "");
  const { data } = await client.get(`/api/perfil/${encodeURIComponent(limpio)}`, {
    // axios omite los parámetros con valor undefined.
    params: {
      max_videos: maxVideos,
      comentarios,
      max_comentarios: maxComentarios,
      refrescar,
    },
  });
  return data;
}

/**
 * Busca los mejores videos sobre un tema esperando a que termine (llamada directa).
 *
 * @param {string} q Tema a buscar (2–60 caracteres, con o sin "#").
 * @param {object} [opciones]
 * @param {number} [opciones.maxResultados] Videos a devolver (1–30, por defecto 10).
 * @param {boolean} [opciones.refrescar] Ignorar la caché de la API.
 */
export async function buscarVideos(q, { maxResultados, refrescar } = {}) {
  const { data } = await client.get("/api/busqueda", {
    params: { q: q.trim(), max_resultados: maxResultados, refrescar },
  });
  return data;
}

// Extracciones asíncronas: el POST responde al instante (202) con el id
// y luego se consulta con GET hasta que el estado sea "completada" o "error".

/**
 * Crea una extracción de perfil en la cola de la API.
 * Recibe las mismas opciones que `obtenerPerfil`.
 *
 * @returns {Promise<object>} Estado inicial de la extracción (`id`, `estado`, ...).
 */
export async function crearExtraccionPerfil(
  usuario,
  { maxVideos, comentarios, maxComentarios, refrescar } = {},
) {
  // JSON.stringify omite las claves con valor undefined.
  const { data } = await client.post("/api/extracciones", {
    tipo: "perfil",
    usuario: usuario.trim(),
    max_videos: maxVideos,
    comentarios,
    max_comentarios: maxComentarios,
    refrescar,
  });
  return data;
}

/**
 * Crea una extracción de búsqueda por tema en la cola de la API.
 * Recibe las mismas opciones que `buscarVideos`.
 *
 * @returns {Promise<object>} Estado inicial de la extracción (`id`, `estado`, ...).
 */
export async function crearExtraccionBusqueda(q, { maxResultados, refrescar } = {}) {
  const { data } = await client.post("/api/extracciones", {
    tipo: "busqueda",
    q: q.trim(),
    max_resultados: maxResultados,
    refrescar,
  });
  return data;
}

/**
 * Consulta el estado de una extracción. Cuando `estado` es "completada", el campo
 * `resultado` trae lo mismo que devolverían /api/perfil o /api/busqueda.
 * Responde 404 si la extracción no existe o venció (30 min).
 *
 * @param {string} id
 */
export async function consultarExtraccion(id) {
  const { data } = await client.get(`/api/extracciones/${encodeURIComponent(id)}`);
  return data;
}
