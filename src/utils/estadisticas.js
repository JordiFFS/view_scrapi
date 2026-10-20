/**
 * Cálculos para el panel de estadísticas. Funciones puras: reciben la lista de videos
 * (de un perfil o de una búsqueda) y devuelven números listos para mostrar o exportar.
 */
import { aFecha } from "./formato";

// Métricas de video.estadisticas, en el orden en que se muestran.
export const METRICAS = [
  { clave: "vistas", etiqueta: "Vistas" },
  { clave: "likes", etiqueta: "Likes" },
  { clave: "comentarios", etiqueta: "Comentarios" },
  { clave: "compartidos", etiqueta: "Compartidos" },
  { clave: "guardados", etiqueta: "Guardados" },
];

// Todo lo que no son vistas cuenta como interacción.
const INTERACCIONES = ["likes", "comentarios", "compartidos", "guardados"];

export const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/**
 * Valor numérico de una métrica; 0 si el video no la trae.
 * @param {object} video
 * @param {string} clave
 */
export function valorMetrica(video, clave) {
  return Number(video.estadisticas?.[clave]) || 0;
}

/**
 * Interacciones totales del video (likes + comentarios + compartidos + guardados).
 * @param {object} video
 */
export function interaccionesDe(video) {
  return INTERACCIONES.reduce((suma, clave) => suma + valorMetrica(video, clave), 0);
}

/**
 * Tasa de interacción: interacciones / vistas. null si el video no tiene vistas.
 * @param {object} video
 * @returns {number | null}
 */
export function tasaInteraccion(video) {
  const vistas = valorMetrica(video, "vistas");
  return vistas > 0 ? interaccionesDe(video) / vistas : null;
}

function mediana(numeros) {
  if (!numeros.length) return 0;
  const orden = [...numeros].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
}

/**
 * Totales, promedios y medianas de todas las métricas.
 *
 * @param {object[]} videos
 * @returns {{
 *   cantidad: number,
 *   totales: Record<string, number>,
 *   promedios: Record<string, number>,
 *   medianas: Record<string, number>,
 *   tasaInteraccion: number | null,   interacciones totales / vistas totales
 * }}
 */
export function resumirVideos(videos) {
  const totales = {};
  const promedios = {};
  const medianas = {};
  for (const { clave } of METRICAS) {
    const valores = videos.map((v) => valorMetrica(v, clave));
    totales[clave] = valores.reduce((a, b) => a + b, 0);
    promedios[clave] = videos.length ? totales[clave] / videos.length : 0;
    medianas[clave] = mediana(valores);
  }
  const interacciones = INTERACCIONES.reduce((suma, clave) => suma + totales[clave], 0);
  return {
    cantidad: videos.length,
    totales,
    promedios,
    medianas,
    tasaInteraccion: totales.vistas > 0 ? interacciones / totales.vistas : null,
  };
}

/**
 * Hashtags de la descripción, en minúsculas y sin repetir: "Hola #Uñas #uñas" -> ["uñas"].
 * @param {string | undefined} descripcion
 * @returns {string[]}
 */
export function extraerHashtags(descripcion) {
  const encontrados = (descripcion ?? "").match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return [...new Set(encontrados.map((h) => h.slice(1).toLowerCase()))];
}

/**
 * Hashtags más usados y el promedio de vistas de los videos que los llevan.
 * Sirve para ver qué etiquetas acompañan a los videos que mejor funcionan.
 *
 * @param {object[]} videos
 * @param {number} [limite]
 * @returns {{ hashtag: string, videos: number, vistasPromedio: number }[]}
 */
export function hashtagsFrecuentes(videos, limite = 10) {
  const conteo = new Map();
  for (const video of videos) {
    for (const hashtag of extraerHashtags(video.descripcion)) {
      const dato = conteo.get(hashtag) ?? { hashtag, videos: 0, vistas: 0 };
      dato.videos += 1;
      dato.vistas += valorMetrica(video, "vistas");
      conteo.set(hashtag, dato);
    }
  }
  return [...conteo.values()]
    .map(({ hashtag, videos: n, vistas }) => ({ hashtag, videos: n, vistasPromedio: vistas / n }))
    .sort((a, b) => b.videos - a.videos || b.vistasPromedio - a.vistasPromedio)
    .slice(0, limite);
}

/**
 * Cantidad de videos y vistas promedio por día de la semana en que se publicaron.
 * Los videos sin fecha no se cuentan.
 *
 * @param {object[]} videos
 * @returns {{ dia: string, videos: number, vistasPromedio: number }[]} Siempre 7 elementos (domingo a sábado).
 */
export function rendimientoPorDia(videos) {
  const dias = DIAS_SEMANA.map((dia) => ({ dia, videos: 0, vistas: 0 }));
  for (const video of videos) {
    const fecha = aFecha(video.fecha);
    if (!fecha) continue;
    const dato = dias[fecha.getDay()];
    dato.videos += 1;
    dato.vistas += valorMetrica(video, "vistas");
  }
  return dias.map(({ dia, videos: n, vistas }) => ({
    dia,
    videos: n,
    vistasPromedio: n ? vistas / n : 0,
  }));
}

/**
 * Creadores que más aparecen en una búsqueda, con sus vistas sumadas.
 *
 * @param {object[]} resultados Videos de /api/busqueda (traen `creador`).
 * @param {number} [limite]
 * @returns {{ usuario: string, videos: number, vistas: number, seguidores: number | null }[]}
 */
export function creadoresFrecuentes(resultados, limite = 8) {
  const conteo = new Map();
  for (const video of resultados) {
    const usuario = video.creador?.usuario ?? "desconocido";
    const dato = conteo.get(usuario) ?? {
      usuario,
      videos: 0,
      vistas: 0,
      seguidores: video.creador?.seguidores ?? null,
    };
    dato.videos += 1;
    dato.vistas += valorMetrica(video, "vistas");
    conteo.set(usuario, dato);
  }
  return [...conteo.values()]
    .sort((a, b) => b.videos - a.videos || b.vistas - a.vistas)
    .slice(0, limite);
}

/**
 * Una fila plana por video con todas las métricas. Es la base de la tabla
 * y de la exportación a CSV, para analizar los datos fuera de la app.
 *
 * @param {object[]} videos
 * @returns {object[]}
 */
export function filasDeVideos(videos) {
  return videos.map((video, i) => {
    const fecha = aFecha(video.fecha);
    const fila = {
      posicion: i + 1,
      id: video.id,
      url: video.url,
      fecha: fecha ? fecha.toISOString() : "",
      dia_semana: fecha ? DIAS_SEMANA[fecha.getDay()] : "",
      hora: fecha ? fecha.getHours() : "",
      descripcion: video.descripcion ?? "",
      hashtags: extraerHashtags(video.descripcion).join(" "),
    };
    for (const { clave } of METRICAS) fila[clave] = valorMetrica(video, clave);
    fila.interacciones = interaccionesDe(video);
    fila.tasa_interaccion = tasaInteraccion(video) ?? "";
    // Solo los resultados de búsqueda traen creador y puntaje.
    if (video.creador) {
      fila.creador = video.creador.usuario ?? "";
      fila.creador_seguidores = video.creador.seguidores ?? "";
    }
    if (video.puntaje) {
      fila.puntaje_total = video.puntaje.total ?? "";
      fila.puntaje_relevancia = video.puntaje.relevancia ?? "";
      fila.puntaje_interaccion = video.puntaje.interaccion ?? "";
      fila.puntaje_alcance = video.puntaje.alcance ?? "";
    }
    return fila;
  });
}
