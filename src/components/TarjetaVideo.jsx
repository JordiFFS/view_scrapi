import { useState } from "react";
import { formatearFecha, formatearNumero } from "../utils";

// Estadísticas que se muestran, en orden. `clave` es el campo dentro de video.estadisticas.
const ESTADISTICAS = [
  { clave: "vistas", etiqueta: "Vistas", icono: "▶" },
  { clave: "likes", etiqueta: "Likes", icono: "♥" },
  { clave: "comentarios", etiqueta: "Comentarios", icono: "💬" },
  { clave: "compartidos", etiqueta: "Compartidos", icono: "↗" },
  { clave: "guardados", etiqueta: "Guardados", icono: "🔖" },
];

// Un comentario dentro del desplegable.
function Comentario({ comentario }) {
  return (
    <li className="rounded-lg bg-slate-50 p-3 text-sm">
      <p className="text-slate-800">{comentario.texto}</p>
      <p className="mt-1 text-xs text-slate-500">
        {comentario.autor_anonimo || "Anónimo"} · {formatearFecha(comentario.fecha)} ·{" "}
        {formatearNumero(comentario.likes)} likes · {formatearNumero(comentario.respuestas)}{" "}
        respuestas
      </p>
    </li>
  );
}

/**
 * Tarjeta de un video: portada (enlaza a TikTok), fecha, descripción, estadísticas
 * y comentarios desplegables.
 *
 * @param {object} props
 * @param {object} props.video Un elemento de `videos` (perfil) o de `resultados` (búsqueda).
 * @param {import("react").ReactNode} [props.children] Contenido extra arriba de la descripción;
 *   la búsqueda lo usa para mostrar el creador y el puntaje.
 */
export function TarjetaVideo({ video, children }) {
  const [abierto, setAbierto] = useState(false);
  // Los videos de búsqueda pueden no traer comentarios ni estadísticas completas.
  const comentarios = video.comentarios ?? [];
  const estadisticas = video.estadisticas ?? {};

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <a href={video.url} target="_blank" rel="noreferrer" className="block bg-slate-900">
        {video.portada ? (
          <img
            src={video.portada}
            alt={video.descripcion || "Portada del video"}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="aspect-[9/16] max-h-96 w-full object-cover sm:max-h-80"
          />
        ) : (
          <div className="flex aspect-[9/16] max-h-96 items-center justify-center text-slate-400 sm:max-h-80">
            Sin portada
          </div>
        )}
      </a>

      <div className="space-y-3 p-4">
        {children}
        <p className="text-xs text-slate-500">{formatearFecha(video.fecha)}</p>
        {video.descripcion && (
          <p className="line-clamp-3 text-sm text-slate-800">{video.descripcion}</p>
        )}

        <ul className="grid grid-cols-5 gap-1 text-center">
          {ESTADISTICAS.map(({ clave, etiqueta, icono }) => (
            <li key={clave} title={etiqueta}>
              <span aria-hidden="true" className="block text-sm">
                {icono}
              </span>
              <span className="block text-xs font-semibold text-slate-900">
                {formatearNumero(estadisticas[clave])}
              </span>
              <span className="sr-only">{etiqueta}</span>
            </li>
          ))}
        </ul>

        {comentarios.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {abierto ? "Ocultar" : "Ver"} comentarios ({comentarios.length})
            </button>
            {abierto && (
              <ul className="mt-3 space-y-2">
                {comentarios.map((c) => (
                  <Comentario key={c.id} comentario={c} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
