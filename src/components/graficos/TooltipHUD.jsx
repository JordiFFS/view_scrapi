/**
 * Cuadro flotante de los gráficos (tooltip) con estilo de visor.
 * Es solo presentación: cada gráfico decide qué filas mostrar a partir de lo que le pasa recharts.
 *
 * Primero va el valor (grande y claro) y luego su nombre: quien mira el tooltip ya sabe qué
 * serie es y busca el número. El color de la serie es una línea corta, nunca el color del texto.
 *
 * @param {object} props
 * @param {string} [props.titulo] Ej. la fecha o la descripción del video.
 * @param {{ etiqueta: string, valor: string, color?: string }[]} props.filas
 */
export function TooltipHUD({ titulo, filas }) {
  return (
    <div className="max-w-60 rounded-lg border border-cyan-400/30 bg-slate-950/95 px-3 py-2 shadow-[0_0_20px_rgb(34_211_238/0.15)] backdrop-blur">
      {titulo && <p className="mb-1 line-clamp-2 font-mono text-[10px] text-slate-400">{titulo}</p>}
      {filas.map(({ etiqueta, valor, color }) => (
        <p key={etiqueta} className="flex items-baseline gap-2">
          {color && <span aria-hidden="true" className="h-0.5 w-3 shrink-0 self-center rounded" style={{ background: color }} />}
          <span className="font-mono text-sm font-bold text-white">{valor}</span>
          <span className="text-[11px] text-slate-400">{etiqueta}</span>
        </p>
      ))}
    </div>
  );
}
