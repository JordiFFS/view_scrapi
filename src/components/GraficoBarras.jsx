/**
 * Gráfico de barras horizontales hecho con divs (sin librerías de gráficos).
 * Cada barra es proporcional al valor más alto; el texto del valor va a la derecha.
 *
 * @param {object} props
 * @param {string} props.titulo
 * @param {string} [props.descripcion] Explica qué mide el gráfico.
 * @param {{ id: string, etiqueta: string, valor: number, texto: string, detalle?: string, url?: string }[]} props.datos
 * @param {import("react").ReactNode} [props.acciones] Controles junto al título (ej. un selector).
 */
export function GraficoBarras({ titulo, descripcion, datos, acciones }) {
  const maximo = Math.max(...datos.map((d) => d.valor), 0);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-900">{titulo}</h4>
          {descripcion && <p className="text-xs text-slate-500">{descripcion}</p>}
        </div>
        {acciones}
      </div>

      {datos.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">Sin datos suficientes.</p>
      ) : (
        <ul className="space-y-2.5">
          {datos.map((d) => {
            const etiqueta = d.url ? (
              <a href={d.url} target="_blank" rel="noreferrer" className="hover:underline">
                {d.etiqueta}
              </a>
            ) : (
              d.etiqueta
            );
            return (
              <li
                key={d.id}
                title={`${d.etiqueta}: ${d.texto}${d.detalle ? ` · ${d.detalle}` : ""}`}
                className="group"
              >
                <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-slate-700">{etiqueta}</span>
                  <span className="shrink-0 font-semibold text-slate-900">{d.texto}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-pink-500 transition-colors group-hover:bg-pink-700"
                    // Un mínimo visible para que los valores pequeños no desaparezcan.
                    style={{ width: `${maximo > 0 ? Math.max((d.valor / maximo) * 100, 1.5) : 0}%` }}
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
