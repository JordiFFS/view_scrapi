import { formatearNumero } from "../utils";

// 0.823 -> "82%"
const porcentaje = (valor) => `${Math.round((valor ?? 0) * 100)}%`;

// Creador y puntaje de un video de /api/busqueda.
/**
 * Datos extra de un video de búsqueda: posición, creador y puntaje.
 * Los puntajes llegan de 0 a 1 y se muestran como porcentaje.
 *
 * @param {object} props
 * @param {number} props.posicion Lugar en el ranking (empieza en 1).
 * @param {{ usuario?: string, nombre?: string, verificado?: boolean, seguidores?: number }} props.creador
 * @param {{ relevancia: number, interaccion: number, alcance: number, total: number }} props.puntaje
 */
export function InfoResultado({ posicion, creador, puntaje }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-white">
          <span className="mr-1 font-mono text-pink-400">#{posicion}</span>@{creador?.usuario ?? "desconocido"}
          {creador?.verificado && <span className="ml-1 text-cyan-300">✔</span>}
        </p>
        <span
          title="Puntaje total"
          className="shrink-0 rounded-full border border-pink-500/50 bg-pink-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-pink-200"
        >
          {porcentaje(puntaje?.total)}
        </span>
      </div>
      {creador?.seguidores != null && (
        <p className="text-xs text-slate-400">{formatearNumero(creador.seguidores)} seguidores</p>
      )}
      {/* Los tres componentes del puntaje como mini barras (0–100 %). */}
      <dl className="space-y-1">
        {[
          ["Relevancia", puntaje?.relevancia],
          ["Interacción", puntaje?.interaccion],
          ["Alcance", puntaje?.alcance],
        ].map(([nombre, valor]) => (
          <div key={nombre} className="flex items-center gap-2 text-[11px]">
            <dt className="w-20 shrink-0 text-slate-400">{nombre}</dt>
            <dd className="flex flex-1 items-center gap-2">
              <span className="h-1 flex-1 rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-cyan-500"
                  style={{ width: porcentaje(valor) }}
                />
              </span>
              <span className="w-8 text-right font-mono text-slate-200">{porcentaje(valor)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
