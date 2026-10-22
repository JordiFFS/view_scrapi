import { formatearPorcentaje } from "../../utils";
import { BarrasPorcentaje } from "./BarrasPorcentaje";
import { COLORES, EMOCIONES } from "./constantes";

/**
 * Barras horizontales con las emociones detectadas en los comentarios.
 *
 * Todas las emociones son la misma medida (proporción de comentarios), así que van en un solo
 * color; el largo de la barra es lo que se compara. Se ordenan de mayor a menor para ver
 * rápido la emoción dominante, y "Otros" va al final en gris porque es un resto.
 *
 * @param {object} props
 * @param {Record<string, number>} props.emociones Objeto `comentarios.emociones` de la API.
 */
export function GraficoEmociones({ emociones }) {
  // 1. Una fila por emoción. Se usa Object.entries para mostrar también emociones nuevas
  //    que la API agregue en el futuro (con su clave como nombre).
  const filas = Object.entries(emociones ?? {}).map(([clave, valor]) => ({
    clave,
    nombre: EMOCIONES[clave] ?? clave,
    valor: Number(valor) || 0,
    color: clave === "otros" ? COLORES.resto : COLORES.principal,
  }));

  // 2. Orden: de mayor a menor, con "otros" siempre al final.
  const datos = [
    ...filas.filter((f) => f.clave !== "otros").sort((a, b) => b.valor - a.valor),
    ...filas.filter((f) => f.clave === "otros"),
  ];

  const descripcion = datos
    .map((d) => `${d.nombre} ${formatearPorcentaje(d.valor, { decimales: 0, separado: true })}`)
    .join(", ");

  // min-w-0: dentro de un grid, evita que el contenido (el SVG de recharts) ensanche la tarjeta en el celular.
  return (
    <section className="panel min-w-0 p-4">
      <h4 className="font-semibold text-white">Emociones en los comentarios</h4>
      <p className="mb-3 text-xs text-slate-400">Qué emoción predomina en lo que escribe la audiencia.</p>
      {datos.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">Sin datos de emociones.</p>
      ) : (
        <BarrasPorcentaje datos={datos} etiquetaAccesible={`Emociones: ${descripcion}.`} />
      )}
    </section>
  );
}
