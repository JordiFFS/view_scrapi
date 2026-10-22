/**
 * Análisis con modelos de IA (Hugging Face) que hace el backend sobre un perfil de TikTok.
 *
 *   GET /api/analisis/{usuario} -> obtenerAnalisis
 *
 * El backend primero extrae el perfil (o lo toma de su caché), luego pasa los textos
 * (descripciones y comentarios) por los modelos y devuelve:
 *   - big5_creador: rasgos de personalidad Big Five estimados a partir de lo que publica el creador.
 *   - comentarios: sentimiento y emociones de los comentarios que recibe.
 * Todos los valores numéricos vienen entre 0 y 1.
 */
import { client } from "./client";

// Esta petición incluye scraping + descarga y ejecución de los modelos, así que puede tardar
// bastante más que las demás. Se da 6 minutos solo a esta llamada; el resto de la app
// mantiene el timeout general de client.js.
const TIMEOUT_ANALISIS_MS = 6 * 60 * 1000;

/**
 * Pide el análisis de IA de un perfil. Recibe las mismas opciones que `obtenerPerfil`
 * (api/tiktok.js), porque el backend extrae el perfil con esos parámetros antes de analizarlo.
 *
 * @param {string} usuario Con o sin "@".
 * @param {object} [opciones]
 * @param {number} [opciones.maxVideos] Posts recientes a analizar (1–30).
 * @param {boolean} [opciones.comentarios] Incluir comentarios en el análisis.
 * @param {number} [opciones.maxComentarios] Comentarios por post (0–100).
 * @param {boolean} [opciones.refrescar] Ignorar la caché de la API.
 * @returns {Promise<{
 *   usuario: string,
 *   desde_cache: boolean,
 *   fecha_analisis: string,
 *   big5_creador: Record<"apertura" | "responsabilidad" | "extraversion" | "amabilidad" | "neuroticismo", number>,
 *   textos_analizados: number,
 *   advertencia: string | null,
 *   comentarios: {
 *     total_analizados: number,
 *     sentimiento: Record<"positivo" | "neutral" | "negativo", number>,
 *     emociones: Record<string, number>,
 *   } | null,
 *   modelos: object,
 *   nota: string,
 * }>}
 */
export async function obtenerAnalisis(
  usuario,
  { maxVideos, comentarios, maxComentarios, refrescar } = {},
) {
  // 1. Se limpia el usuario igual que en obtenerPerfil: sin espacios y sin "@".
  const limpio = usuario.trim().replace(/^@/, "");

  // 2. Se hace el GET con los parámetros en snake_case (axios omite los undefined)
  //    y un timeout propio que reemplaza al de client.js solo para esta petición.
  const { data } = await client.get(`/api/analisis/${encodeURIComponent(limpio)}`, {
    params: {
      max_videos: maxVideos,
      comentarios,
      max_comentarios: maxComentarios,
      refrescar,
    },
    timeout: TIMEOUT_ANALISIS_MS,
  });

  // 3. Si falla, el interceptor de client.js ya convirtió el error en un mensaje en español.
  return data;
}
