/**
 * Medidas sobre los datos que llegan de la API: tamaño del JSON, cuántos campos tiene,
 * qué tan anidado está y cuánto tardó. Las usa el inspector de datos para mostrar
 * "cómo se trata la información" entre el scraper y los gráficos.
 */
const LOCALE = "es-EC";

/**
 * Tamaño en bytes del JSON tal como viaja por la red (UTF-8).
 * @param {unknown} datos
 * @returns {number}
 */
export function tamanoJSON(datos) {
  if (datos === undefined) return 0;
  // TextEncoder cuenta bytes reales: "ñ" o un emoji ocupan más de 1 byte.
  return new TextEncoder().encode(JSON.stringify(datos)).length;
}

/**
 * Bytes legibles: 950 -> "950 B", 48230 -> "47,1 KB".
 * @param {number} bytes
 * @returns {string}
 */
export function formatearBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toLocaleString(LOCALE, { maximumFractionDigits: 1 })} KB`;
  return `${(kb / 1024).toLocaleString(LOCALE, { maximumFractionDigits: 1 })} MB`;
}

/**
 * Duración legible: 850 -> "0,9 s", 102000 -> "1:42 min".
 * @param {number | null | undefined} ms
 * @returns {string}
 */
export function formatearDuracion(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return "—";
  if (ms < 60000) return `${(ms / 1000).toLocaleString(LOCALE, { maximumFractionDigits: 1 })} s`;
  const segundos = Math.round(ms / 1000);
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")} min`;
}

/**
 * Recorre el JSON completo y cuenta su estructura.
 *
 * @param {unknown} datos
 * @returns {{ claves: number, valores: number, objetos: number, arreglos: number, profundidad: number }}
 *   claves: campos con nombre · valores: datos finales (texto, número, booleano, null)
 *   profundidad: niveles de anidación (1 = objeto plano)
 */
export function estructuraJSON(datos) {
  const conteo = { claves: 0, valores: 0, objetos: 0, arreglos: 0, profundidad: 0 };

  // Recorrido recursivo: cada llamada sabe en qué nivel está.
  function recorrer(valor, nivel) {
    if (Array.isArray(valor)) {
      conteo.arreglos += 1;
      conteo.profundidad = Math.max(conteo.profundidad, nivel);
      valor.forEach((v) => recorrer(v, nivel + 1));
    } else if (valor !== null && typeof valor === "object") {
      conteo.objetos += 1;
      conteo.profundidad = Math.max(conteo.profundidad, nivel);
      for (const v of Object.values(valor)) {
        conteo.claves += 1;
        recorrer(v, nivel + 1);
      }
    } else {
      conteo.valores += 1;
    }
  }

  recorrer(datos, 1);
  return conteo;
}

/**
 * Total de comentarios extraídos en una lista de videos.
 * @param {object[] | undefined} videos
 * @returns {number}
 */
export function contarComentarios(videos) {
  return (videos ?? []).reduce((suma, v) => suma + (v.comentarios?.length ?? 0), 0);
}
