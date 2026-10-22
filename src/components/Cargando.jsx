import { TextoRotativo } from "./TextoRotativo";

// Qué hace el scraper en cada tipo de extracción. Se muestran rotando mientras se espera.
const PASOS = {
  perfil: [
    "Abriendo TikTok en un navegador…",
    "Leyendo los datos públicos del perfil…",
    "Recorriendo la cuadrícula de videos…",
    "Abriendo cada video para leer sus estadísticas…",
    "Capturando los comentarios…",
    "Ordenando todo en JSON…",
  ],
  busqueda: [
    "Convirtiendo tu tema en hashtags…",
    "Abriendo las páginas públicas de cada hashtag…",
    "Reuniendo los videos candidatos…",
    "Comparando cada video con tu tema…",
    "Ordenando por relevancia, interacción y alcance…",
  ],
};

// Texto según el estado que informa la API: pendiente (en cola) o en_proceso.
function textoProgreso(progreso) {
  if (!progreso) return "Enviando solicitud...";
  if (progreso.estado === "pendiente") {
    return progreso.posicionEnCola
      ? `En cola: posición ${progreso.posicionEnCola}`
      : "En cola, esperando turno...";
  }
  return "Extrayendo datos de TikTok...";
}

// --- Iconos (SVG en línea, sin librerías de UI: ver ESTRUCTURA.md) ---

function IconoCorazon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function IconoComentario(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function IconoOjo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 5C6.5 5 2.4 9.1 1 12c1.4 2.9 5.5 7 11 7s9.6-4.1 11-7c-1.4-2.9-5.5-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    </svg>
  );
}

function IconoLupa(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" fill="rgb(255 255 255 / 0.35)" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  );
}

function IconoReloj(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// Datos que "salen" de la página mientras se extrae: icono, color, posición y retraso.
const DATOS_VOLANDO = [
  { Icono: IconoCorazon, color: "text-pink-500", posicion: "left-[18%]", retraso: "0ms" },
  { Icono: IconoOjo, color: "text-sky-500", posicion: "left-[46%]", retraso: "800ms" },
  { Icono: IconoComentario, color: "text-violet-500", posicion: "left-[74%]", retraso: "1600ms" },
];

/**
 * Ilustración animada del scraping: una ventana de navegador con la cuadrícula de videos,
 * una línea que la escanea, una lupa que la recorre y datos que salen volando.
 * En cola (`enCola`) se queda quieta y en gris, con un reloj.
 */
function IlustracionScraping({ enCola }) {
  return (
    <div aria-hidden="true" className="relative w-56 pt-10">
      {/* Datos extraídos que suben desde la página */}
      {!enCola &&
        DATOS_VOLANDO.map(({ Icono, color, posicion, retraso }) => (
          <Icono
            key={posicion}
            style={{ animationDelay: retraso }}
            className={`absolute top-8 size-5 opacity-0 motion-safe:animate-subir-dato ${color} ${posicion}`}
          />
        ))}

      {/* Ventana del navegador */}
      <div
        className={`overflow-hidden rounded-xl bg-slate-900 shadow-lg shadow-black/50 ring-1 ring-white/10 transition ${
          enCola ? "opacity-60 grayscale" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-2.5 py-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="ml-2 truncate rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400 ring-1 ring-white/10">
            tiktok.com/@…
          </span>
        </div>

        <div className="relative grid grid-cols-3 gap-1.5 p-2.5">
          {/* Miniaturas de videos, con un parpadeo escalonado */}
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 150}ms` }}
              className="aspect-[3/4] rounded-md bg-gradient-to-br from-pink-500/40 via-violet-500/20 to-cyan-500/40 motion-safe:animate-pulse"
            />
          ))}

          {!enCola && (
            <>
              {/* Línea láser que escanea la página */}
              <div className="pointer-events-none absolute inset-x-1 top-0 h-0.5 rounded-full bg-pink-500 shadow-[0_0_12px_3px_rgb(236_72_153/0.6)] motion-safe:animate-escanear" />
              {/* Lupa recorriendo los videos */}
              <IconoLupa className="absolute top-2 left-2 size-9 text-cyan-200 drop-shadow-[0_0_6px_rgb(34_211_238/0.8)] motion-safe:animate-lupa" />
            </>
          )}
        </div>
      </div>

      {enCola && (
        <span className="absolute -right-3 -bottom-3 grid size-10 place-items-center rounded-full bg-amber-400 text-white shadow-md">
          <IconoReloj className="size-6 motion-safe:animate-spin motion-safe:[animation-duration:3s]" />
        </span>
      )}
    </div>
  );
}

/**
 * Indicador de carga animado con el estado de la extracción.
 * `titulo` y `detalle` permiten reutilizarlo en otras esperas.
 *
 * @param {object} props
 * @param {{ estado: string, posicionEnCola: number | null } | null} [props.progreso]
 *   null mientras se envía el POST; luego lo actualiza useExtraccion.
 * @param {"perfil" | "busqueda"} [props.tipo] Elige las frases que se muestran rotando.
 * @param {string} [props.titulo] Reemplaza el texto calculado a partir de `progreso`.
 * @param {import("react").ReactNode} [props.detalle] Reemplaza la línea "Esto puede tardar...".
 */
export function Cargando({
  progreso = null,
  tipo = "perfil",
  titulo,
  detalle = "Esto puede tardar hasta 3 minutos...",
}) {
  const enCola = progreso?.estado === "pendiente";

  return (
    <div
      role="status"
      className="panel esquinas flex flex-col items-center gap-4 px-4 py-8 text-center"
    >
      <IlustracionScraping enCola={enCola} />

      <div className="space-y-1">
        <p className="font-mono text-sm font-semibold tracking-wide text-white uppercase">
          {titulo ?? textoProgreso(progreso)}
        </p>
        {/* Sin título propio se cuenta qué hace el scraper; en cola todavía no hace nada. */}
        {!titulo && !enCola && (
          <TextoRotativo frases={PASOS[tipo] ?? PASOS.perfil} className="min-h-5 text-sm text-pink-300" />
        )}
      </div>

      {/* Barra indeterminada: un brillo que la recorre sin inventar un porcentaje */}
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full w-1/3 rounded-full motion-safe:animate-barrido ${
            enCola ? "bg-amber-400" : "bg-gradient-to-r from-pink-500 to-violet-500"
          }`}
        />
      </div>

      {detalle && <p className="text-sm text-slate-400">{detalle}</p>}
    </div>
  );
}
