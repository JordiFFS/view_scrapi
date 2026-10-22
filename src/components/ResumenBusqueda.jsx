import { formatearNumero } from "../utils";

/**
 * Resumen arriba de los resultados: consulta normalizada, cantidad de videos
 * y hashtags que se usaron para buscar.
 *
 * @param {object} props
 * @param {object} props.busqueda Respuesta completa de la búsqueda (`resultado` de la extracción).
 */
export function ResumenBusqueda({ busqueda }) {
  return (
    <section className="panel esquinas p-4">
      <p className="etiqueta-hud">// consulta procesada</p>
      <p className="mt-1 text-sm text-slate-300">
        Resultados para <span className="font-semibold text-white">“{busqueda.consulta}”</span>
      </p>
      <p className="mt-1 font-mono text-[11px] text-slate-400">
        {formatearNumero(busqueda.total_resultados)} de {formatearNumero(busqueda.total_candidatos)}{" "}
        videos evaluados · {busqueda.desde_cache ? "Datos desde caché" : "Datos recién extraídos"}
      </p>
      {busqueda.hashtags_usados?.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {busqueda.hashtags_usados.map((h) => (
            <li key={h} className="rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-1 font-mono text-xs text-pink-200">
              #{h}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
