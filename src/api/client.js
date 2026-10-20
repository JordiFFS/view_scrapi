/**
 * Cliente HTTP compartido por toda la app.
 *
 * Todas las peticiones a la API pasan por esta instancia de axios, así la URL base,
 * el timeout y el manejo de errores se configuran en un solo lugar.
 */
import axios from "axios";

// Las llamadas directas (GET /api/perfil, GET /api/busqueda) hacen scraping en vivo
// y pueden tardar entre 1 y 3 minutos; este margen evita cortarlas antes de tiempo.
const TIMEOUT_MS = 240000;

export const client = axios.create({
  // Viene de .env (VITE_API_URL). Vite reemplaza import.meta.env al compilar.
  baseURL: import.meta.env.VITE_API_URL,
  timeout: TIMEOUT_MS,
});

/**
 * Convierte un error de axios en un mensaje en español que se pueda mostrar al usuario.
 * Prioriza el campo `detail` que devuelve FastAPI.
 *
 * @param {import("axios").AxiosError} error
 * @returns {string}
 */
function mensajeDeError(error) {
  // Se superó TIMEOUT_MS sin respuesta.
  if (error.code === "ECONNABORTED") {
    return "La API tardó demasiado en responder. Intenta de nuevo en unos minutos.";
  }

  // Sin `response` significa que nunca hubo respuesta: API apagada, URL incorrecta o CORS.
  if (!error.response) {
    return "No se pudo conectar con la API. Verifica que esté encendida y que VITE_API_URL sea correcta.";
  }

  const { status, data } = error.response;
  const detalle = data?.detail;

  // Errores lanzados con HTTPException(detail="...") en la API.
  if (typeof detalle === "string") return detalle;
  // FastAPI devuelve una lista de errores cuando falla la validación (422).
  if (Array.isArray(detalle)) {
    return detalle.map((d) => d.msg).filter(Boolean).join(". ") || "Datos inválidos.";
  }

  if (status === 404) return "No se encontró el recurso solicitado.";
  if (status >= 500) return "La API tuvo un error interno. Intenta de nuevo más tarde.";
  return `Error inesperado (código ${status}).`;
}

// Interceptor de respuestas: las exitosas pasan tal cual; las fallidas se rechazan con
// un Error cuyo `message` ya es legible. El error original queda en `cause` para depurar.
client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(mensajeDeError(error), { cause: error })),
);
