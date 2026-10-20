import { useState } from "react";
import { formatearFecha, formatearNumero, formatearPorcentaje } from "../utils";

// Columnas numéricas que se pueden ordenar. `clave` es el campo de la fila (filasDeVideos).
const COLUMNAS = [
  { clave: "vistas", etiqueta: "Vistas", formato: formatearNumero },
  { clave: "likes", etiqueta: "Likes", formato: formatearNumero },
  { clave: "comentarios", etiqueta: "Coment.", formato: formatearNumero },
  { clave: "compartidos", etiqueta: "Compart.", formato: formatearNumero },
  { clave: "guardados", etiqueta: "Guard.", formato: formatearNumero },
  { clave: "tasa_interaccion", etiqueta: "Interacción", formato: formatearPorcentaje },
];

/**
 * Tabla con todas las métricas de cada video. Se ordena tocando el encabezado
 * (primero de mayor a menor, otro toque invierte el orden).
 * En el celular se desplaza horizontalmente dentro de su caja.
 *
 * @param {object} props
 * @param {object[]} props.filas Resultado de `filasDeVideos`.
 */
export function TablaVideos({ filas }) {
  const [orden, setOrden] = useState({ clave: "vistas", descendente: true });

  const ordenadas = [...filas].sort((a, b) => {
    // Los vacíos ("" = sin dato) siempre al final.
    const va = a[orden.clave] === "" ? -Infinity : a[orden.clave];
    const vb = b[orden.clave] === "" ? -Infinity : b[orden.clave];
    return orden.descendente ? vb - va : va - vb;
  });

  function ordenarPor(clave) {
    setOrden((o) => ({ clave, descendente: o.clave === clave ? !o.descendente : true }));
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h4 className="font-semibold text-slate-900">Detalle por video</h4>
      <p className="mb-3 text-xs text-slate-500">Toca un encabezado para ordenar.</p>
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-3 font-medium">Video</th>
              {COLUMNAS.map(({ clave, etiqueta }) => (
                <th key={clave} className="py-2 pl-2 text-right font-medium" aria-sort={
                  orden.clave === clave ? (orden.descendente ? "descending" : "ascending") : "none"
                }>
                  <button
                    type="button"
                    onClick={() => ordenarPor(clave)}
                    className={`whitespace-nowrap hover:text-slate-900 ${
                      orden.clave === clave ? "font-semibold text-pink-700" : ""
                    }`}
                  >
                    {etiqueta}
                    {orden.clave === clave && (orden.descendente ? " ↓" : " ↑")}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((fila) => (
              <tr key={fila.id} className="border-b border-slate-100 last:border-0">
                <td className="max-w-56 py-2 pr-3">
                  <a
                    href={fila.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-slate-800 hover:underline"
                  >
                    {fila.descripcion || "Sin descripción"}
                  </a>
                  <span className="text-slate-500">
                    {fila.creador ? `@${fila.creador} · ` : ""}
                    {formatearFecha(fila.fecha)}
                  </span>
                </td>
                {COLUMNAS.map(({ clave, formato }) => (
                  <td key={clave} className="py-2 pl-2 text-right tabular-nums text-slate-900">
                    {fila[clave] === "" ? "—" : formato(fila[clave])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
