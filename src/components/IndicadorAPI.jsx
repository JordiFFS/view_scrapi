// Color del punto y texto según el estado que devuelve useSalud.
const ESTADOS = {
  comprobando: { punto: "bg-amber-400", texto: "Conectando…" },
  en_linea: { punto: "bg-emerald-400", texto: "En línea" },
  sin_conexion: { punto: "bg-rose-500", texto: "Sin conexión" },
};

/**
 * Píldora de estado de la API para la cabecera: punto de color (que late si está en línea),
 * texto, latencia de GET /api/salud y la dirección del servidor.
 * Tocarla vuelve a comprobar la conexión.
 *
 * @param {object} props
 * @param {"comprobando" | "en_linea" | "sin_conexion"} props.estado
 * @param {number | null} props.latenciaMs
 * @param {string} [props.url] VITE_API_URL, se muestra sin "http://".
 * @param {() => void} props.onComprobar
 */
export function IndicadorAPI({ estado, latenciaMs, url, onComprobar }) {
  const { punto, texto } = ESTADOS[estado] ?? ESTADOS.comprobando;
  const host = (url ?? "").replace(/^https?:\/\//, "");

  return (
    <button
      type="button"
      onClick={onComprobar}
      title={`Comprobar de nuevo ${url ?? ""}/api/salud`}
      aria-label={`Estado de la API: ${texto}${latenciaMs !== null ? `, ${latenciaMs} milisegundos` : ""}. Tocar para comprobar de nuevo.`}
      className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pr-3 pl-2 font-mono text-[11px] whitespace-nowrap text-slate-300 transition hover:border-cyan-400/40"
    >
      {/* Punto con un halo que se expande (animate-ping) mientras la API responde. */}
      <span className="relative flex size-2.5" aria-hidden="true">
        {estado === "en_linea" && (
          <span className={`absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping ${punto}`} />
        )}
        <span className={`relative inline-flex size-2.5 rounded-full ${punto}`} />
      </span>
      <span className="hidden min-[400px]:inline">API ·</span>
      <span>{texto}</span>
      {latenciaMs !== null && <span className="text-cyan-300 tabular-nums">{latenciaMs} ms</span>}
      {host && <span className="hidden text-slate-500 sm:inline">· {host}</span>}
    </button>
  );
}
