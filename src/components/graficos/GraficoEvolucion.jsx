import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { aFecha, formatearFecha, formatearNumero, formatearPorcentaje, tasaInteraccion, valorMetrica } from "../../utils";
import { ANIMACION_MS, sinCortes, TEMA } from "./tema";
import { TooltipHUD } from "./TooltipHUD";

// Métricas que se pueden ver en el tiempo. `valor` saca el número de cada video.
const OPCIONES = [
  { id: "vistas", etiqueta: "Vistas", valor: (v) => valorMetrica(v, "vistas"), formato: formatearNumero },
  { id: "likes", etiqueta: "Likes", valor: (v) => valorMetrica(v, "likes"), formato: formatearNumero },
  { id: "tasa", etiqueta: "Interacción", valor: (v) => tasaInteraccion(v) ?? 0, formato: formatearPorcentaje },
];

function mediana(numeros) {
  const orden = [...numeros].sort((a, b) => a - b);
  const mitad = Math.floor(orden.length / 2);
  return orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2;
}

/**
 * Evolución de una métrica según la fecha de publicación de cada video (gráfico de área).
 *
 * Interacción: botones para cambiar de métrica (el área se redibuja con animación), una línea
 * vertical que sigue al dedo o al mouse y un tooltip con el video y su valor. La línea
 * horizontal es la mediana: lo que está arriba funcionó mejor que la mitad de los videos.
 *
 * @param {object} props
 * @param {object[]} props.videos Videos del perfil o resultados de la búsqueda.
 */
export function GraficoEvolucion({ videos }) {
  const [metrica, setMetrica] = useState("vistas");
  const opcion = OPCIONES.find((o) => o.id === metrica);

  // 1. Una fila por video con fecha, ordenadas de la más antigua a la más reciente.
  const datos = useMemo(
    () =>
      videos
        .map((v) => ({ video: v, fecha: aFecha(v.fecha) }))
        .filter(({ fecha }) => fecha)
        .sort((a, b) => a.fecha - b.fecha)
        .map(({ video, fecha }) => ({
          id: video.id,
          fechaCorta: fecha.toLocaleDateString("es-EC", { day: "numeric", month: "short" }),
          fechaLarga: formatearFecha(fecha),
          descripcion: video.descripcion,
          valor: opcion.valor(video),
        })),
    [videos, opcion],
  );

  if (datos.length < 2) {
    return null;
  }

  // 2. La mediana sirve de referencia: qué videos están por encima de lo "normal".
  const referencia = mediana(datos.map((d) => d.valor));

  return (
    <section className="panel min-w-0 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-white">Evolución por fecha de publicación</h4>
          <p className="text-xs text-slate-400">
            {opcion.etiqueta} de cada video en el tiempo. Línea horizontal: mediana ({opcion.formato(referencia)}).
          </p>
        </div>
        {/* 3. Selector de métrica: botones con aria-pressed (se sabe cuál está activo sin ver el color). */}
        <div role="group" aria-label="Métrica" className="flex gap-1 rounded-lg border border-white/10 bg-black/30 p-0.5">
          {OPCIONES.map(({ id, etiqueta }) => (
            <button
              key={id}
              type="button"
              aria-pressed={metrica === id}
              onClick={() => setMetrica(id)}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition ${
                metrica === id ? "bg-pink-500/20 text-pink-200" : "text-slate-400 hover:text-white"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            {/* Degradado del área: el color de la serie que se desvanece hacia abajo. */}
            <linearGradient id="evolucion-relleno" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TEMA.principal} stopOpacity={0.35} />
              <stop offset="100%" stopColor={TEMA.principal} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={TEMA.cuadricula} />
          <XAxis
            dataKey="fechaCorta"
            tick={{ fontSize: 10, fill: TEMA.textoSuave }}
            axisLine={{ stroke: TEMA.eje }}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            tickFormatter={(n) => sinCortes(opcion.formato(n))}
            tick={{ fontSize: 10, fill: TEMA.textoSuave }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <ReferenceLine y={referencia} stroke={TEMA.textoSuave} strokeOpacity={0.5} />
          <Tooltip
            cursor={{ stroke: TEMA.cursor, strokeWidth: 1 }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipHUD
                  titulo={`${payload[0].payload.fechaLarga} · ${payload[0].payload.descripcion ?? ""}`}
                  filas={[{ etiqueta: opcion.etiqueta, valor: opcion.formato(payload[0].value), color: TEMA.principalClaro }]}
                />
              ) : null
            }
          />
          {/* key={metrica}: al cambiar de métrica, recharts vuelve a animar el área desde cero. */}
          <Area
            key={metrica}
            type="monotone"
            dataKey="valor"
            stroke={TEMA.principalClaro}
            strokeWidth={2}
            fill="url(#evolucion-relleno)"
            dot={{ r: 3, fill: TEMA.principalClaro, stroke: TEMA.superficie, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: TEMA.principalClaro, stroke: TEMA.superficie, strokeWidth: 2 }}
            animationDuration={ANIMACION_MS}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
