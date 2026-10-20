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
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-600">
        Resultados para <span className="font-semibold text-slate-900">“{busqueda.consulta}”</span>
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {formatearNumero(busqueda.total_resultados)} de {formatearNumero(busqueda.total_candidatos)}{" "}
        videos evaluados · {busqueda.desde_cache ? "Datos desde caché" : "Datos recién extraídos"}
      </p>
      {busqueda.hashtags_usados?.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {busqueda.hashtags_usados.map((h) => (
            <li key={h} className="rounded-full bg-pink-50 px-2.5 py-1 text-xs text-pink-700">
              #{h}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
