import { useEffect, useRef } from "react";

// Símbolo y color de cada tipo de línea del registro (ver useExtraccion).
const NIVELES = {
  envio: { simbolo: "→", color: "text-cyan-300" },
  respuesta: { simbolo: "←", color: "text-slate-300" },
  espera: { simbolo: "⟳", color: "text-amber-300" },
  ok: { simbolo: "✓", color: "text-emerald-300" },
  error: { simbolo: "✕", color: "text-rose-400" },
};

// 3250 ms -> "+00:03.2"
function marcaTiempo(ms) {
  const segundos = ms / 1000;
  const min = Math.floor(segundos / 60);
  const seg = (segundos % 60).toFixed(1).padStart(4, "0");
  return `+${String(min).padStart(2, "0")}:${seg}`;
}

/**
 * Ventana de terminal con la bitácora real de la extracción: cada petición a la API,
 * cada cambio de estado y el resultado, con el tiempo desde que empezó.
 *
 * @param {object} props
 * @param {{ ms: number, nivel: string, texto: string }[]} props.registro Viene de useExtraccion.
 * @param {boolean} [props.activo] Muestra el cursor parpadeando mientras se espera.
 * @param {string} [props.titulo]
 */
export function ConsolaRegistro({ registro, activo = false, titulo = "registro.log" }) {
  const lista = useRef(null);

  // Cada vez que llega una línea nueva, la consola baja hasta el final (como una terminal real).
  // Se mueve solo el scroll de la lista; scrollIntoView movería también la página entera.
  useEffect(() => {
    if (lista.current) lista.current.scrollTop = lista.current.scrollHeight;
  }, [registro.length]);

  return (
    <section className="panel overflow-hidden">
      {/* Barra de título de la ventana */}
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/30 px-3 py-2">
        <span className="size-2.5 rounded-full bg-rose-500/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-[11px] text-slate-500">{titulo}</span>
      </div>

      {/* role="log" + aria-live: los lectores de pantalla anuncian las líneas nuevas. */}
      <ol
        ref={lista}
        role="log"
        aria-live="polite"
        // En vivo es una ventana baja que sigue la última línea; terminada, se ve casi completa.
        className={`space-y-1 overflow-y-auto px-3 py-3 font-mono text-[11px] leading-relaxed sm:text-xs ${
          activo ? "max-h-56" : "max-h-96"
        }`}
      >
        {registro.length === 0 && <li className="text-slate-600">Sin actividad todavía.</li>}
        {registro.map((linea, i) => {
          const nivel = NIVELES[linea.nivel] ?? NIVELES.respuesta;
          return (
            <li key={i} className="flex gap-2 motion-safe:animate-aparecer">
              <span className="shrink-0 text-slate-600 tabular-nums">{marcaTiempo(linea.ms)}</span>
              <span aria-hidden="true" className={`shrink-0 ${nivel.color}`}>
                {nivel.simbolo}
              </span>
              <span className={`min-w-0 break-words ${nivel.color}`}>{linea.texto}</span>
            </li>
          );
        })}
        {activo && (
          <li className="flex gap-2 text-slate-500">
            <span aria-hidden="true">$</span>
            <span className="inline-block h-4 w-2 bg-cyan-300 motion-safe:animate-parpadeo" aria-label="Esperando" />
          </li>
        )}
      </ol>
    </section>
  );
}
