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
    <li className="rounded-lg border border-white/5 bg-black/30 p-3 text-sm">
      <p className="text-slate-200">{comentario.texto}</p>
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
    <article className="panel group/video overflow-hidden transition hover:-translate-y-0.5 hover:border-pink-500/40 hover:shadow-[0_0_24px_rgb(236_72_153/0.15)]">
      <a href={video.url} target="_blank" rel="noreferrer" className="relative block bg-black">
        {video.portada ? (
          <img
            src={video.portada}
            alt={video.descripcion || "Portada del video"}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="aspect-[9/16] max-h-96 w-full object-cover opacity-90 transition group-hover/video:opacity-100 sm:max-h-80"
          />
        ) : (
          <div className="flex aspect-[9/16] max-h-96 items-center justify-center text-slate-500 sm:max-h-80">
            Sin portada
          </div>
        )}
        {/* Línea de escaneo que recorre la portada al pasar el mouse. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-cyan-300 opacity-0 shadow-[0_0_12px_3px_rgb(34_211_238/0.6)] group-hover/video:opacity-100 motion-safe:group-hover/video:animate-escanear"
        />
      </a>

      <div className="space-y-3 p-4">
        {children}
        <p className="font-mono text-[11px] text-slate-500">{formatearFecha(video.fecha)}</p>
        {video.descripcion && (
          <p className="line-clamp-3 text-sm text-slate-200">{video.descripcion}</p>
        )}

        <ul className="grid grid-cols-5 gap-1 rounded-xl border border-white/5 bg-black/20 py-2 text-center">
          {ESTADISTICAS.map(({ clave, etiqueta, icono }) => (
            <li key={clave} title={etiqueta}>
              <span aria-hidden="true" className="block text-sm">
                {icono}
              </span>
              <span className="block font-mono text-xs font-semibold text-white">
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
              className="boton-borde w-full py-2"
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
