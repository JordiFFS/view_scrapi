import { formatearPorcentaje } from "../../utils";

/**
 * Cuadro que aparece al pasar el dedo o el mouse sobre un gráfico de recharts.
 * Recharts le pasa `active` y `payload`; cada fila de datos trae `nombre` y `valor` (0–1).
 *
 * Se usa como `<Tooltip content={<TooltipPorcentaje />} />`.
 *
 * @param {object} props
 * @param {boolean} [props.active] Si el puntero está sobre un dato.
 * @param {{ payload: { nombre: string, valor: number, color?: string } }[]} [props.payload]
 */
export function TooltipPorcentaje({ active, payload }) {
  if (!active || !payload?.length) return null;
  // `payload[0].payload` es la fila original de `data` que recibió el gráfico.
  const { nombre, valor, color } = payload[0].payload;

  return (
    <div className="rounded-lg border border-cyan-400/30 bg-slate-950/95 px-3 py-2 text-xs shadow-[0_0_20px_rgb(34_211_238/0.15)]">
      {/* Primero el valor (lo que se busca) y luego el nombre. El color es una línea corta
          junto al texto; el texto nunca va del color de la serie. */}
      <p className="font-mono text-sm font-bold text-white">
        {formatearPorcentaje(valor, { decimales: 0, separado: true })}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 text-slate-400">
        {color && <span className="h-0.5 w-3 rounded" style={{ backgroundColor: color }} />}
        {nombre}
      </p>
    </div>
  );
}
