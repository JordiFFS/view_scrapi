import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { formatearNumero, formatearPorcentaje, resumirVideos, tasaInteraccion, valorMetrica } from "../../utils";
import { ANIMACION_MS, sinCortes, TEMA } from "./tema";
import { TooltipHUD } from "./TooltipHUD";

/**
 * Dispersión: cada punto es un video. Horizontal = vistas (escala logarítmica, porque un
 * video viral puede tener 100 veces más que el resto), vertical = tasa de interacción,
 * tamaño = comentarios. La línea horizontal es la tasa general del conjunto.
 *
 * Responde a "¿los videos más vistos también son los que más enganchan?":
 * puntos arriba a la derecha = mucho alcance y mucha interacción.
 *
 * @param {object} props
 * @param {object[]} props.videos
 */
export function GraficoDispersion({ videos }) {
  // 1. Solo videos con vistas: la escala logarítmica no admite 0.
  const datos = videos
    .filter((v) => valorMetrica(v, "vistas") > 0)
    .map((v) => ({
      id: v.id,
      descripcion: v.descripcion,
      vistas: valorMetrica(v, "vistas"),
      tasa: tasaInteraccion(v) ?? 0,
      comentarios: valorMetrica(v, "comentarios"),
    }));

  if (datos.length < 3) return null;

  // 2. Tasa general (interacciones totales / vistas totales) como referencia.
  const general = resumirVideos(videos).tasaInteraccion;

  // 3. Rango y marcas del eje logarítmico: un margen a cada lado para que los puntos grandes
  //    no queden cortados, y marcas "redondas" (1, 3, 10, 30, 100...) dentro de ese rango.
  const vistas = datos.map((d) => d.vistas);
  const dominio = [Math.min(...vistas) / 1.5, Math.max(...vistas) * 1.5];
  const marcas = [];
  for (let base = 1; base <= dominio[1]; base *= 10) {
    for (const n of [base, base * 3]) if (n >= dominio[0] && n <= dominio[1]) marcas.push(n);
  }

  return (
    <section className="panel min-w-0 p-4">
      <h4 className="font-semibold text-white">¿Más vistas = más interacción?</h4>
      <p className="mb-3 text-xs text-slate-400">
        Cada punto es un video; su tamaño son los comentarios. Línea: tasa general ({formatearPorcentaje(general)}).
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={TEMA.cuadricula} />
          <XAxis
            type="number"
            dataKey="vistas"
            name="Vistas"
            scale="log"
            domain={dominio}
            ticks={marcas}
            allowDataOverflow
            tickFormatter={(n) => sinCortes(formatearNumero(n))}
            tick={{ fontSize: 10, fill: TEMA.textoSuave }}
            axisLine={{ stroke: TEMA.eje }}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="tasa"
            name="Interacción"
            tickFormatter={(n) => formatearPorcentaje(n, { decimales: 0 })}
            tick={{ fontSize: 10, fill: TEMA.textoSuave }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          {/* ZAxis no dibuja un eje: convierte "comentarios" en el área de cada punto. */}
          <ZAxis type="number" dataKey="comentarios" range={[50, 420]} />
          {general !== null && <ReferenceLine y={general} stroke={TEMA.textoSuave} strokeOpacity={0.5} />}
          <Tooltip
            cursor={{ stroke: TEMA.cursor, strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <TooltipHUD
                  titulo={p.descripcion}
                  filas={[
                    { etiqueta: "vistas", valor: formatearNumero(p.vistas) },
                    { etiqueta: "interacción", valor: formatearPorcentaje(p.tasa) },
                    { etiqueta: "comentarios", valor: formatearNumero(p.comentarios) },
                  ]}
                />
              );
            }}
          />
          {/* Puntos semitransparentes con un anillo del color del fondo: se ven aunque se encimen. */}
          <Scatter
            data={datos}
            fill={TEMA.principal}
            fillOpacity={0.7}
            stroke={TEMA.superficie}
            strokeWidth={2}
            animationDuration={ANIMACION_MS}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </section>
  );
}
