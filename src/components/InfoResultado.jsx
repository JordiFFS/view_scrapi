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
        <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
          <span className="mr-1 text-pink-600">#{posicion}</span>@{creador?.usuario ?? "desconocido"}
          {creador?.verificado && <span className="ml-1 text-sky-500">✔</span>}
        </p>
        <span
          title="Puntaje total"
          className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white"
        >
          {porcentaje(puntaje?.total)}
        </span>
      </div>
      {creador?.seguidores != null && (
        <p className="text-xs text-slate-500">{formatearNumero(creador.seguidores)} seguidores</p>
      )}
      <p className="text-xs text-slate-500">
        Relevancia {porcentaje(puntaje?.relevancia)} · Interacción {porcentaje(puntaje?.interaccion)} ·
        Alcance {porcentaje(puntaje?.alcance)}
      </p>
    </div>
  );
}
