import { TarjetaVideo } from "./TarjetaVideo";

/**
 * Cuadrícula con los videos de un perfil (1 columna en móvil, hasta 3 en escritorio).
 *
 * @param {object} props
 * @param {object[]} props.videos
 */
export function ListaVideos({ videos }) {
  if (!videos?.length) {
    return <p className="panel py-6 text-center text-slate-400">Este perfil no tiene videos extraídos.</p>;
  }

  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold text-white">
        Videos <span className="font-mono text-sm text-cyan-300">[{videos.length}]</span>
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <TarjetaVideo key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
