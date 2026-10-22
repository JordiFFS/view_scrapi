// Iconos simples en SVG (24x24, trazo), uno por etapa.
const ICONOS = {
  fuente: <path d="M9 4v10.5a3.5 3.5 0 1 1-3.5-3.5M9 4c.5 2.5 2.5 4.5 5 5" />,
  scraper: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 8h18M7 13h4M7 15.5h7" />
    </>
  ),
  api: (
    <>
      <rect x="4" y="3" width="16" height="7" rx="1.5" />
      <rect x="4" y="14" width="16" height="7" rx="1.5" />
      <path d="M8 6.5h.01M8 17.5h.01M12 10v4" />
    </>
  ),
  navegador: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
  graficos: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
};

/** Las cinco etapas por las que pasan los datos, en orden. */
export const ETAPAS = [
  { id: "fuente", nombre: "TikTok", detalle: "Páginas públicas" },
  { id: "scraper", nombre: "Scraper", detalle: "Playwright · navegador real" },
  { id: "api", nombre: "API FastAPI", detalle: "Cola · caché · JSON" },
  { id: "navegador", nombre: "Navegador", detalle: "Hooks + utils (React)" },
  { id: "graficos", nombre: "Visualización", detalle: "Gráficos y tablas" },
];

/**
 * Qué etapa está trabajando según el progreso de la extracción.
 *   enviando (sin progreso) o en cola -> la API · extrayendo -> el scraper.
 *
 * @param {{ estado: string } | null} progreso
 * @returns {string}
 */
export function etapaDesdeProgreso(progreso) {
  return progreso?.estado === "en_proceso" ? "scraper" : "api";
}

/**
 * Diagrama del recorrido de los datos: TikTok → Scraper → API → Navegador → Visualización.
 *
 * Mientras se extrae, la etapa activa brilla y un "paquete" viaja por su conexión.
 * Al terminar, todas quedan completas y cada una muestra un dato real de la extracción.
 * En el celular las etapas van en columna; desde `md` (tablet) en fila.
 *
 * @param {object} props
 * @param {string | null} [props.activa] Id de la etapa en curso; null si todo terminó.
 * @param {Record<string, string>} [props.medidas] Texto por etapa al terminar (ej. "10 videos").
 */
export function PipelineDatos({ activa = null, medidas = {} }) {
  const indiceActivo = activa ? ETAPAS.findIndex((e) => e.id === activa) : ETAPAS.length;

  return (
    <section className="panel esquinas p-4">
      <p className="etiqueta-hud">// recorrido de los datos</p>
      <ol className="mt-3 flex flex-col md:flex-row md:items-stretch">
        {ETAPAS.map((etapa, i) => {
          const estado = i < indiceActivo ? "hecha" : i === indiceActivo ? "activa" : "pendiente";
          const ultima = i === ETAPAS.length - 1;

          return (
            <li key={etapa.id} className="flex flex-col md:flex-1 md:flex-row md:items-center">
              {/* Nodo de la etapa */}
              <div
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition md:w-full md:flex-col md:text-center ${
                  estado === "activa"
                    ? "border-pink-500/60 bg-pink-500/10 shadow-[0_0_20px_rgb(236_72_153/0.35)]"
                    : estado === "hecha"
                      ? "border-cyan-400/30 bg-cyan-400/5"
                      : "border-white/10 bg-white/[0.02] opacity-50"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`size-6 shrink-0 ${
                    estado === "activa"
                      ? "text-pink-400 motion-safe:animate-pulse"
                      : estado === "hecha"
                        ? "text-cyan-300"
                        : "text-slate-500"
                  }`}
                >
                  {ICONOS[etapa.id]}
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{etapa.nombre}</p>
                  <p className="text-[11px] text-slate-400">{etapa.detalle}</p>
                  {medidas[etapa.id] && (
                    <p className="mt-0.5 font-mono text-[11px] text-cyan-300">{medidas[etapa.id]}</p>
                  )}
                  {/* Texto para lectores de pantalla: el estado no depende solo del color. */}
                  <span className="sr-only">
                    {estado === "activa" ? " (en curso)" : estado === "hecha" ? " (completada)" : " (pendiente)"}
                  </span>
                </div>
              </div>

              {/* Conexión hacia la siguiente etapa (vertical en el celular, horizontal en pantallas anchas). */}
              {!ultima && (
                <div aria-hidden="true" className="relative mx-auto h-5 w-px md:mx-0 md:h-px md:w-6 md:shrink-0">
                  <span
                    className={`absolute inset-0 ${i < indiceActivo ? "bg-cyan-400/50" : "bg-white/15"}`}
                  />
                  {/* El paquete viaja por la conexión que llega a la etapa activa. */}
                  {i === indiceActivo - 1 && (
                    <>
                      <span className="absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6] motion-safe:animate-paquete-y md:hidden" />
                      <span className="absolute top-1/2 hidden size-1.5 -translate-y-1/2 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6] motion-safe:animate-paquete md:block" />
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
