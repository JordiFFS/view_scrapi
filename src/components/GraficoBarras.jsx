import { useEffect, useState } from "react";

/**
 * Gráfico de barras horizontales hecho con divs (sin librerías de gráficos).
 * Cada barra es proporcional al valor más alto; el texto del valor va a la derecha.
 *
 * Es dinámico: al aparecer, las barras crecen desde 0 una tras otra, y cuando cambian los
 * datos (por ejemplo, otra métrica en el selector) se estiran o encogen con una transición CSS.
 *
 * @param {object} props
 * @param {string} props.titulo
 * @param {string} [props.descripcion] Explica qué mide el gráfico.
 * @param {{ id: string, etiqueta: string, valor: number, texto: string, detalle?: string, url?: string }[]} props.datos
 * @param {import("react").ReactNode} [props.acciones] Controles junto al título (ej. un selector).
 */
export function GraficoBarras({ titulo, descripcion, datos, acciones }) {
  const maximo = Math.max(...datos.map((d) => d.valor), 0);
  // false en el primer render: las barras empiezan en 0 y en el siguiente cuadro crecen.
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setListo(true));
    return () => cancelAnimationFrame(cuadro);
  }, []);

  return (
    <section className="panel min-w-0 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-white">{titulo}</h4>
          {descripcion && <p className="text-xs text-slate-400">{descripcion}</p>}
        </div>
        {acciones}
      </div>

      {datos.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">Sin datos suficientes.</p>
      ) : (
        <ul className="space-y-2.5">
          {datos.map((d, i) => {
            const etiqueta = d.url ? (
              <a href={d.url} target="_blank" rel="noreferrer" className="hover:text-cyan-300 hover:underline">
                {d.etiqueta}
              </a>
            ) : (
              d.etiqueta
            );
            // Un mínimo visible para que los valores pequeños no desaparezcan.
            const ancho = maximo > 0 ? Math.max((d.valor / maximo) * 100, 1.5) : 0;
            return (
              <li
                key={d.id}
                title={`${d.etiqueta}: ${d.texto}${d.detalle ? ` · ${d.detalle}` : ""}`}
                className="group"
              >
                <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-slate-300">{etiqueta}</span>
                  <span className="shrink-0 font-mono font-semibold text-white">{d.texto}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-600 to-pink-400 transition-[width,box-shadow] duration-700 ease-out group-hover:shadow-[0_0_12px_rgb(236_72_153/0.8)] motion-reduce:transition-none"
                    // Cada barra arranca 50 ms después de la anterior: se ve una "ola".
                    style={{ width: `${listo ? ancho : 0}%`, transitionDelay: listo ? `${i * 50}ms` : "0ms" }}
                  />
                </div>
                {d.detalle && <p className="mt-0.5 text-[11px] text-slate-500">{d.detalle}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
