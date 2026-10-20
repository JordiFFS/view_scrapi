/**
 * Descarga de datos desde el navegador (CSV y JSON), para analizarlos luego en
 * Excel, Python, etc. No usa librerías: arma el archivo y simula un clic en un enlace.
 */

function descargar(contenido, nombreArchivo, tipo) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Encierra en comillas los valores con separadores, comillas o saltos de línea.
function celdaCSV(valor) {
  const texto = String(valor ?? "");
  return /[",;\n\r]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

/**
 * Descarga una lista de objetos como CSV. Las columnas salen de las claves de todas las filas.
 * Lleva BOM para que Excel abra bien las tildes y la ñ.
 *
 * @param {object[]} filas
 * @param {string} nombreArchivo Sin extensión.
 */
export function descargarCSV(filas, nombreArchivo) {
  const columnas = [...new Set(filas.flatMap((f) => Object.keys(f)))];
  const lineas = [
    columnas.join(","),
    ...filas.map((f) => columnas.map((c) => celdaCSV(f[c])).join(",")),
  ];
  descargar(`﻿${lineas.join("\r\n")}`, `${nombreArchivo}.csv`, "text/csv;charset=utf-8");
}

/**
 * Descarga cualquier dato como JSON con sangría.
 *
 * @param {unknown} datos
 * @param {string} nombreArchivo Sin extensión.
 */
export function descargarJSON(datos, nombreArchivo) {
  descargar(JSON.stringify(datos, null, 2), `${nombreArchivo}.json`, "application/json");
}

/**
 * Nombre de archivo seguro: "Uñas acrílicas" -> "unas-acrilicas-2026-10-17".
 * @param {string} base
 */
export function nombreArchivo(base) {
  const limpio = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${limpio || "datos"}-${new Date().toISOString().slice(0, 10)}`;
}
