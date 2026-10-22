import { InfoResultado } from "./InfoResultado";
import { TarjetaVideo } from "./TarjetaVideo";

/**
 * Cuadrícula con los resultados de una búsqueda, en el orden que devuelve la API
 * (ya vienen ordenados por puntaje total).
 *
 * @param {object} props
 * @param {object[]} props.resultados
 */
export function ListaResultados({ resultados }) {
  if (!resultados?.length) {
    return <p className="panel py-6 text-center text-slate-400">No se encontraron videos sobre este tema.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resultados.map((video, i) => (
        <TarjetaVideo key={video.id} video={video}>
          <InfoResultado posicion={i + 1} creador={video.creador} puntaje={video.puntaje} />
        </TarjetaVideo>
      ))}
    </div>
  );
}
