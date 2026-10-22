import { formatearPorcentaje } from "../../utils";
import { BarrasPorcentaje } from "./BarrasPorcentaje";
import { SENTIMIENTOS } from "./constantes";

/**
 * Barras horizontales con la proporción de comentarios positivos, neutrales y negativos.
 *
 * Los colores forman una escala divergente: azul (positivo) y rojo (negativo) en los extremos
 * y gris en el medio. El orden es siempre el mismo para comparar perfiles entre sí.
 *
 * @param {object} props
 * @param {Record<"positivo" | "neutral" | "negativo", number>} props.sentimiento
 * @param {number} props.total Comentarios analizados.
 */
export function GraficoSentimiento({ sentimiento, total }) {
  // 1. Del objeto de la API a una fila por sentimiento, con su nombre y color.
  const datos = SENTIMIENTOS.map(({ clave, nombre, color }) => ({
    clave,
    nombre,
    color,
    valor: Number(sentimiento?.[clave]) || 0,
  }));

  // 2. Descripción para lectores de pantalla con todos los valores.
  const descripcion = datos
    .map((d) => `${d.nombre} ${formatearPorcentaje(d.valor, { decimales: 0, separado: true })}`)
    .join(", ");

  // min-w-0: dentro de un grid, evita que el contenido (el SVG de recharts) ensanche la tarjeta en el celular.
  return (
    <section className="panel min-w-0 p-4">
      <h4 className="font-semibold text-white">Sentimiento de los comentarios</h4>
      <p className="mb-3 text-xs text-slate-400">
        Cómo reacciona la audiencia, sobre {total} {total === 1 ? "comentario" : "comentarios"}.
      </p>
      <BarrasPorcentaje datos={datos} etiquetaAccesible={`Sentimiento: ${descripcion}.`} />
    </section>
  );
}
