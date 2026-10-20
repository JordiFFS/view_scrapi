import { formatearNumero } from "../utils";

// Un contador del perfil (seguidores, siguiendo, likes).
function Dato({ etiqueta, valor }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-lg font-bold text-slate-900">{formatearNumero(valor)}</p>
      <p className="text-xs text-slate-500">{etiqueta}</p>
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
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-4">
        {perfil.avatar ? (
          <img
            src={perfil.avatar}
            alt={`Avatar de ${perfil.usuario}`}
            // Las imágenes del CDN de TikTok pueden bloquearse si se envía el Referer.
            referrerPolicy="no-referrer"
            className="size-20 shrink-0 rounded-full object-cover ring-2 ring-pink-500"
          />
        ) : (
          <div className="size-20 shrink-0 rounded-full bg-slate-200" />
        )}
        <div className="min-w-0">
          <h2 className="flex items-center gap-1 truncate text-xl font-bold text-slate-900">
            {perfil.nombre || perfil.usuario}
            {perfil.verificado && (
              <span title="Cuenta verificada" className="text-sky-500">
                ✔
              </span>
            )}
          </h2>
          <p className="truncate text-slate-500">@{perfil.usuario}</p>
          {perfil.privado && (
            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              Cuenta privada
            </span>
          )}
        </div>
      </div>

      {perfil.biografia && (
        <p className="mt-4 whitespace-pre-line text-sm text-slate-700">{perfil.biografia}</p>
      )}

      <div className="mt-5 flex divide-x divide-slate-200">
        <Dato etiqueta="Seguidores" valor={perfil.seguidores} />
        <Dato etiqueta="Siguiendo" valor={perfil.siguiendo} />
        <Dato etiqueta="Likes" valor={perfil.likes_totales} />
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        {desdeCache ? "Datos desde caché" : "Datos recién extraídos"}
        {fechaExtraccion && ` · ${new Date(fechaExtraccion).toLocaleString("es-EC")}`}
      </p>
    </section>
  );
}
