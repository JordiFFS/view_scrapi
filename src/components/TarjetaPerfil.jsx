import { formatearNumero } from "../utils";
import { NumeroAnimado } from "./NumeroAnimado";

// Un contador del perfil (seguidores, siguiendo, likes), que cuenta al aparecer.
function Dato({ etiqueta, valor }) {
  return (
    <div className="flex-1 text-center">
      <p className="font-mono text-xl font-bold text-white">
        <NumeroAnimado valor={valor} formato={formatearNumero} />
      </p>
      <p className="etiqueta-hud !text-[9px] !text-slate-500">{etiqueta}</p>
    </div>
  );
}

/**
 * Cabecera del perfil: avatar, nombre, @usuario, bio y contadores.
 *
 * @param {object} props
 * @param {object} props.perfil Objeto `perfil` de la respuesta de la API.
 * @param {boolean} props.desdeCache Si la API respondió desde su caché.
 * @param {string} props.fechaExtraccion Fecha ISO de cuándo se extrajeron los datos.
 */
export function TarjetaPerfil({ perfil, desdeCache, fechaExtraccion }) {
  return (
    <section className="panel esquinas overflow-hidden p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="etiqueta-hud">// objetivo extraído</p>
        {/* Sello de origen: caché o extracción en vivo. */}
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
            desdeCache
              ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
              : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          }`}
        >
          {desdeCache ? "CACHÉ" : "EN VIVO"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {/* Avatar con un anillo de degradado que gira lentamente detrás. */}
        <div className="relative size-20 shrink-0">
          <div
            aria-hidden="true"
            className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,#ec4899,#8b5cf6,#22d3ee,#ec4899)] opacity-80 blur-[2px] motion-safe:animate-[spin_6s_linear_infinite]"
          />
          {perfil.avatar ? (
            <img
              src={perfil.avatar}
              alt={`Avatar de ${perfil.usuario}`}
              // Las imágenes del CDN de TikTok pueden bloquearse si se envía el Referer.
              referrerPolicy="no-referrer"
              className="relative size-20 rounded-full border-2 border-fondo object-cover"
            />
          ) : (
            <div className="relative size-20 rounded-full border-2 border-fondo bg-slate-800" />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="flex items-center gap-1 truncate text-xl font-bold text-white">
            {perfil.nombre || perfil.usuario}
            {perfil.verificado && (
              <span title="Cuenta verificada" className="text-cyan-300">
                ✔
              </span>
            )}
          </h2>
          <p className="truncate font-mono text-sm text-pink-300">@{perfil.usuario}</p>
          {perfil.privado && (
            <span className="mt-1 inline-block rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">
              Cuenta privada
            </span>
          )}
        </div>
      </div>

      {perfil.biografia && (
        <p className="mt-4 text-sm whitespace-pre-line text-slate-300">{perfil.biografia}</p>
      )}

      <div className="mt-5 flex divide-x divide-white/10 rounded-xl border border-white/10 bg-black/20 py-3">
        <Dato etiqueta="Seguidores" valor={perfil.seguidores} />
        <Dato etiqueta="Siguiendo" valor={perfil.siguiendo} />
        <Dato etiqueta="Likes" valor={perfil.likes_totales} />
      </div>

      {fechaExtraccion && (
        <p className="mt-3 text-center font-mono text-[11px] text-slate-500">
          extraído {new Date(fechaExtraccion).toLocaleString("es-EC")}
        </p>
      )}
    </section>
  );
}
