/**
 * Funciones para mostrar números y fechas en formato de Ecuador (es-EC).
 */
const LOCALE = "es-EC";

// De mayor a menor: se usa la primera escala que el número alcance.
const ESCALAS = [
  { valor: 1e9, sufijo: "mil M" },
  { valor: 1e6, sufijo: "M" },
  { valor: 1e3, sufijo: "mil" },
];

/**
 * Abrevia números grandes: 12500 -> "12,5 mil", 3400000 -> "3,4 M".
 * Devuelve "—" si el valor no existe o no es un número.
 *
 * @param {number | string | null | undefined} numero
 * @returns {string}
 */
export function formatearNumero(numero) {
  if (numero === null || numero === undefined || Number.isNaN(Number(numero))) return "—";
  const n = Number(numero);
  const escala = ESCALAS.find((e) => Math.abs(n) >= e.valor);
  if (!escala) return n.toLocaleString(LOCALE);
  const corto = (n / escala.valor).toLocaleString(LOCALE, { maximumFractionDigits: 1 });
  return `${corto} ${escala.sufijo}`;
}

/**
 * Formatea una proporción como porcentaje: 0.0523 -> "5,2 %".
 * Devuelve "—" si el valor no existe o no es un número.
 *
 * @param {number | null | undefined} proporcion
 * @returns {string}
 */
export function formatearPorcentaje(proporcion) {
  if (proporcion === null || proporcion === undefined || Number.isNaN(Number(proporcion))) return "—";
  return Number(proporcion).toLocaleString(LOCALE, { style: "percent", maximumFractionDigits: 1 });
}

/**
 * Convierte texto ISO o timestamps (en segundos o en milisegundos) en un Date.
 * Devuelve null si la fecha no existe o no es válida.
 *
 * @param {string | number | null | undefined} fecha
 * @returns {Date | null}
 */
export function aFecha(fecha) {
  if (!fecha) return null;
  // Un timestamp menor a 1e12 está en segundos (en ms sería una fecha de 1970).
  const valor = typeof fecha === "number" && fecha < 1e12 ? fecha * 1000 : fecha;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Formatea una fecha como "5 oct 2026".
 * Acepta texto ISO o timestamps en segundos o en milisegundos.
 *
 * @param {string | number | null | undefined} fecha
 * @returns {string}
 */
export function formatearFecha(fecha) {
  if (!fecha) return "—";
  const d = aFecha(fecha);
  if (!d) return String(fecha);
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" });
}
