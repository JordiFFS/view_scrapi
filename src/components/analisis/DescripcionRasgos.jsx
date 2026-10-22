import { formatearPorcentaje } from "../../utils";
import { RASGOS } from "./constantes";

/**
 * Clasifica un valor 0–1 en tres niveles para dar una interpretación en palabras.
 * Los cortes (1/3 y 2/3) son una convención simple para leer el resultado, no una norma clínica.
 *
 * @param {number} valor
 * @returns {{ etiqueta: string, clases: string }}
 */
function nivelDe(valor) {
  if (valor >= 2 / 3) return { etiqueta: "Alto", clases: "border-pink-500/40 bg-pink-500/15 text-pink-200" };
  if (valor <= 1 / 3) return { etiqueta: "Bajo", clases: "border-slate-500/40 bg-slate-500/15 text-slate-300" };
  return { etiqueta: "Medio", clases: "border-amber-400/40 bg-amber-400/10 text-amber-200" };
}

/**
 * Explicación corta de cada rasgo Big Five con su porcentaje, una barra de nivel y qué
 * significa un valor alto o bajo. Es la versión en texto del radar: se puede leer sin el gráfico.
 *
 * @param {object} props
 * @param {Record<string, number>} props.big5 Objeto `big5_creador` de la API.
 */
export function DescripcionRasgos({ big5 }) {
  // min-w-0: dentro de un grid, evita que el contenido (el SVG de recharts) ensanche la tarjeta en el celular.
  return (
    <section className="panel min-w-0 p-4">
      <h4 className="font-semibold text-white">¿Qué significa cada rasgo?</h4>
      <p className="text-xs text-slate-400">Alto: 67 % o más · Medio: entre 34 % y 66 % · Bajo: 33 % o menos.</p>

      <ul className="mt-3 divide-y divide-white/5">
        {RASGOS.map(({ clave, nombre, descripcion, alto, bajo }) => {
          const valor = Number(big5?.[clave]) || 0;
          const nivel = nivelDe(valor);
          // Se muestra la lectura que corresponde al nivel; en "Medio" no se elige un extremo.
          const lectura = nivel.etiqueta === "Alto" ? alto : nivel.etiqueta === "Bajo" ? bajo : null;

          return (
            <li key={clave} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-white">{nombre}</p>
                <p className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase ${nivel.clases}`}>
                    {nivel.etiqueta}
                  </span>
                  <span className="font-mono text-sm font-semibold text-white tabular-nums">
                    {formatearPorcentaje(valor, { decimales: 0, separado: true })}
                  </span>
                </p>
              </div>

              {/* Barra de nivel: el fondo es un rosado muy claro (mismo tono) para que se lea la escala completa. */}
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10" aria-hidden="true">
                {/* animate-crecer: la barra se llena desde 0 hasta su ancho al aparecer. */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-600 to-pink-400 motion-safe:animate-crecer"
                  style={{ width: `${valor * 100}%` }}
                />
              </div>

              <p className="mt-1.5 text-sm text-slate-300">{descripcion}</p>
              {lectura && <p className="mt-0.5 text-xs text-slate-400">{lectura}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
