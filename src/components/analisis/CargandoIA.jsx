import { useEffect, useState } from "react";
import { TextoRotativo } from "../TextoRotativo";

// Lo que hacen los modelos del backend (ver la API: services/analisis.py). Se muestran rotando.
const PENSAMIENTOS = [
  "Leyendo la biografía y las descripciones del creador…",
  "Traduciendo los textos al inglés con opus-mt…",
  "Estimando los cinco rasgos de personalidad (Big Five)…",
  "Leyendo los comentarios de la audiencia…",
  "Midiendo si son positivos, neutrales o negativos…",
  "Detectando alegría, sorpresa, enojo y otras emociones…",
  "Promediando los resultados…",
];

// Las 4 tareas del análisis, con un emoji como icono (sin librerías de iconos).
const MODELOS = [
  { icono: "🌐", nombre: "Traducción" },
  { icono: "🧠", nombre: "Big Five" },
  { icono: "💬", nombre: "Sentimiento" },
  { icono: "🎭", nombre: "Emociones" },
];

// Red neuronal del dibujo: neuronas por capa (x fija) y conexiones entre capas vecinas.
const CAPAS = [
  { x: 20, ys: [30, 60, 90] },
  { x: 75, ys: [18, 46, 74, 102] },
  { x: 130, ys: [32, 60, 88] },
  { x: 180, ys: [60] },
];
const CONEXIONES = CAPAS.slice(0, -1).flatMap((capa, i) =>
  capa.ys.flatMap((y1) => CAPAS[i + 1].ys.map((y2) => [capa.x, y1, CAPAS[i + 1].x, y2])),
);

/**
 * Tiempo transcurrido desde `inicio`, actualizado cada segundo: "1:05".
 * Ayuda a que una espera larga no parezca que la app se colgó.
 */
function TiempoTranscurrido({ inicio }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    // Un intervalo de 1 s que se limpia al desmontar (cuando termina la carga).
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const segundos = Math.max(0, Math.floor((ahora - (inicio ?? ahora)) / 1000));
  const texto = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
  return <span className="tabular-nums">{texto}</span>;
}

/**
 * Red neuronal en SVG: las señales viajan por las conexiones (línea punteada que avanza)
 * y las neuronas se encienden una tras otra, capa por capa.
 */
function RedNeuronal() {
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true" className="w-full max-w-64">
      <defs>
        <linearGradient id="ia-conexion" x1="0" x2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {CONEXIONES.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="url(#ia-conexion)"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.55"
          style={{ animationDelay: `${(i % 5) * 120}ms` }}
          className="motion-safe:animate-flujo"
        />
      ))}

      {CAPAS.map((capa, c) =>
        capa.ys.map((y, n) => (
          <circle
            key={`${c}-${n}`}
            cx={capa.x}
            cy={y}
            r={c === CAPAS.length - 1 ? 9 : 6}
            fill={c === CAPAS.length - 1 ? "#8b5cf6" : "#f472b6"}
            stroke="#fff"
            strokeWidth="2"
            // Cada capa se enciende un poco después que la anterior: parece que la señal avanza.
            style={{ animationDelay: `${c * 350 + n * 90}ms` }}
            className="motion-safe:animate-pulse"
          />
        )),
      )}
    </svg>
  );
}

/**
 * Pantalla de espera del análisis con IA: un "cerebro" (red neuronal) pensando, frases de lo
 * que hacen los modelos, los 4 modelos trabajando y el tiempo transcurrido.
 *
 * @param {object} props
 * @param {number | null} props.inicio Hora (Date.now()) en que empezó el análisis.
 */
export function CargandoIA({ inicio }) {
  return (
    <div
      role="status"
      className="relative overflow-hidden rounded-2xl bg-slate-950 px-4 py-8 text-center text-white shadow-lg"
    >
      {/* Halos de color difuminados de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 -left-10 size-56 rounded-full bg-pink-600/30 blur-3xl motion-safe:animate-pulse" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-violet-600/30 blur-3xl motion-safe:animate-pulse motion-safe:[animation-delay:1s]" />

      <div className="relative flex flex-col items-center gap-5">
        {/* Red neuronal con un anillo que late detrás */}
        <div className="relative flex w-full justify-center motion-safe:animate-flotar">
          <span aria-hidden="true" className="absolute top-1/2 left-1/2 size-24 -translate-1/2 rounded-full bg-violet-500/20 motion-safe:animate-ping" />
          <RedNeuronal />
        </div>

        <div className="space-y-2">
          <p className="flex items-center justify-center gap-1 text-xl font-bold">
            <span className="bg-gradient-to-r from-pink-400 via-violet-300 to-pink-400 bg-[length:200%_auto] bg-clip-text text-transparent motion-safe:animate-texto-brillo">
              La IA está pensando
            </span>
            {/* Tres puntos que rebotan, como cuando alguien está escribiendo */}
            <span aria-hidden="true" className="flex gap-1 pl-1">
              {[0, 150, 300].map((retraso) => (
                <span
                  key={retraso}
                  style={{ animationDelay: `${retraso}ms` }}
                  className="size-1.5 rounded-full bg-violet-300 motion-safe:animate-bounce"
                />
              ))}
            </span>
          </p>
          <TextoRotativo frases={PENSAMIENTOS} cadaMs={3000} className="min-h-5 text-sm text-slate-300" />
        </div>

        {/* Los 4 modelos, cada uno con un punto "trabajando" */}
        <ul className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
          {MODELOS.map(({ icono, nombre }, i) => (
            <li
              key={nombre}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-200 ring-1 ring-white/10 backdrop-blur"
            >
              <span aria-hidden="true">{icono}</span>
              {nombre}
              <span
                aria-hidden="true"
                style={{ animationDelay: `${i * 300}ms` }}
                className="size-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse"
              />
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-400">
          Puede tardar varios minutos la primera vez (se cargan los modelos) · Tiempo:{" "}
          <TiempoTranscurrido inicio={inicio} />
        </p>
      </div>
    </div>
  );
}
