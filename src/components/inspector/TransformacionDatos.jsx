import { formatearNumero, formatearPorcentaje } from "../../utils";

// Columnas de la fila que se resaltan como "calculadas en el navegador" (no vienen de la API).
const CALCULADAS = new Set(["posicion", "dia_semana", "hora", "hashtags", "interacciones", "tasa_interaccion"]);

// Cómo mostrar cada valor de la fila plana.
function formatearCelda(clave, valor) {
  if (valor === "" || valor === null || valor === undefined) return "—";
  if (clave === "tasa_interaccion") return formatearPorcentaje(valor);
  if (typeof valor === "number") return formatearNumero(valor);
  return String(valor);
}

// Copia del video sin los campos más largos, para que el JSON de ejemplo se lea fácil.
function videoResumido(video) {
  const { comentarios, portada, ...resto } = video;
  return {
    ...resto,
    portada: portada ? `${String(portada).slice(0, 32)}…` : portada,
    comentarios: comentarios ? `[${comentarios.length} comentarios]` : undefined,
  };
}

/**
 * Antes y después de un video: el objeto anidado que entrega la API y la fila plana que
 * arma `filasDeVideos()` (utils/estadisticas.js) para los gráficos, la tabla y el CSV.
 * Las columnas calculadas en el navegador se marcan en rosado.
 *
 * @param {object} props
 * @param {object} props.video Primer video de la respuesta.
 * @param {object} props.fila La fila correspondiente de filasDeVideos.
 */
export function TransformacionDatos({ video, fila }) {
  return (
    <section className="panel p-4">
      <p className="etiqueta-hud">// transformación de un video</p>
      <h4 className="mt-1 font-semibold text-white">De JSON anidado a una fila lista para graficar</h4>
      <p className="mt-1 text-xs text-slate-400">
        La API entrega cada video como un objeto con otros objetos dentro. El navegador lo aplana, calcula
        interacciones, tasa, día, hora y hashtags, y con eso alimenta los gráficos, la tabla y el CSV.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        {/* Antes: JSON tal como llega */}
        <div className="min-w-0">
          <p className="mb-1.5 font-mono text-[11px] text-slate-500">entrada · respuesta de la API</p>
          <pre className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
            {JSON.stringify(videoResumido(video), null, 2)}
          </pre>
        </div>

        {/* Flecha con el nombre de la función que transforma */}
        <div className="flex items-center justify-center gap-2 font-mono text-[11px] text-pink-300 lg:h-full lg:flex-col">
          <span aria-hidden="true" className="text-lg">
            <span className="lg:hidden">↓</span>
            <span className="hidden lg:inline">→</span>
          </span>
          filasDeVideos()
        </div>

        {/* Después: fila plana */}
        <div className="min-w-0">
          <p className="mb-1.5 font-mono text-[11px] text-slate-500">salida · fila plana</p>
          <dl className="max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[11px]">
            {Object.entries(fila).map(([clave, valor]) => {
              const calculada = CALCULADAS.has(clave);
              return (
                <div key={clave} className="flex justify-between gap-3 border-b border-white/5 py-1 last:border-0">
                  <dt className={calculada ? "text-pink-300" : "text-sky-300"}>
                    {clave}
                    {calculada && <span className="ml-1 text-[9px] text-pink-400/70">calc</span>}
                  </dt>
                  <dd className="min-w-0 truncate text-right text-slate-200" title={String(valor)}>
                    {formatearCelda(clave, valor)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
