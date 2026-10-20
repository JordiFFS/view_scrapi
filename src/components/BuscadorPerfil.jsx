import { useState } from "react";
import { CampoNumero, limitar } from "./CampoNumero";

// Mismos límites y valores por defecto que la API (GET /api/perfil).
const VIDEOS = { minimo: 1, maximo: 30, porDefecto: 10 };
const COMENTARIOS = { minimo: 0, maximo: 100, porDefecto: 20 };

/**
 * Formulario para buscar un perfil: campo de usuario, botón y opciones.
 * Solo maneja el estado del formulario; la petición la hace quien recibe `onBuscar`.
 *
 * @param {object} props
 * @param {(usuario: string, opciones: {
 *   maxVideos: number, comentarios: boolean, maxComentarios?: number, refrescar: boolean,
 * }) => void} props.onBuscar
 * @param {boolean} props.cargando Deshabilita el formulario mientras hay una búsqueda en curso.
 */
export function BuscadorPerfil({ onBuscar, cargando }) {
  const [usuario, setUsuario] = useState("");
  // Se guardan como texto para que el campo se pueda borrar mientras se escribe.
  const [maxVideos, setMaxVideos] = useState(String(VIDEOS.porDefecto));
  // true por defecto, igual que en la API.
  const [comentarios, setComentarios] = useState(true);
  const [maxComentarios, setMaxComentarios] = useState(String(COMENTARIOS.porDefecto));
  const [refrescar, setRefrescar] = useState(false);

  // La API acepta el usuario con o sin "@"; solo se evita enviar un campo vacío.
  const vacio = usuario.trim().replace(/^@/, "") === "";

  function manejarEnvio(e) {
    e.preventDefault();
    if (vacio || cargando) return;
    const videos = limitar(maxVideos, VIDEOS);
    const porVideo = limitar(maxComentarios, COMENTARIOS);
    // Se muestra el valor corregido si estaba fuera de rango o vacío.
    setMaxVideos(String(videos));
    setMaxComentarios(String(porVideo));
    onBuscar(usuario, {
      maxVideos: videos,
      comentarios,
      // Sin comentarios no tiene sentido enviar cuántos.
      maxComentarios: comentarios ? porVideo : undefined,
      refrescar,
    });
  }

  return (
    <form onSubmit={manejarEnvio} className="space-y-3">
      <label htmlFor="usuario" className="sr-only">
        Usuario de TikTok
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            @
          </span>
          <input
            id="usuario"
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="usuario"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            disabled={cargando}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-3 pl-8 text-base text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 disabled:bg-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={cargando || vacio}
          className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {cargando ? "Buscando…" : "Buscar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CampoNumero
          id="max-videos"
          etiqueta="Videos a extraer"
          valor={maxVideos}
          onCambiar={setMaxVideos}
          limites={VIDEOS}
          disabled={cargando}
        />
        <CampoNumero
          id="max-comentarios"
          etiqueta="Comentarios por video"
          valor={maxComentarios}
          onCambiar={setMaxComentarios}
          limites={COMENTARIOS}
          disabled={cargando || !comentarios}
        />
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={comentarios}
            onChange={(e) => setComentarios(e.target.checked)}
            disabled={cargando}
            className="size-4 accent-pink-600"
          />
          Incluir comentarios
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={refrescar}
            onChange={(e) => setRefrescar(e.target.checked)}
            disabled={cargando}
            className="size-4 accent-pink-600"
          />
          Ignorar caché
        </label>
      </div>
    </form>
  );
}
