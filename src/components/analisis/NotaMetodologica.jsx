/**
 * Convierte la descripción de un modelo en texto. La API puede mandar solo el nombre
 * ("cardiffnlp/...") o un objeto con más datos; en ese caso se listan sus valores.
 *
 * @param {unknown} valor
 * @returns {string}
 */
function textoModelo(valor) {
  if (valor === null || valor === undefined) return "—";
  if (typeof valor === "object") {
    return Object.entries(valor)
      .map(([clave, v]) => `${clave}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join(" · ");
  }
  return String(valor);
}

/**
 * Cómo se obtuvieron los resultados: advertencia de la API, nota metodológica y modelos usados.
 * Es importante mostrarlo: los modelos dan una estimación a partir de textos cortos, no un
 * diagnóstico, y el usuario debe saberlo antes de sacar conclusiones.
 *
 * @param {object} props
 * @param {string} [props.nota] Campo `nota` de la API.
 * @param {string | null} [props.advertencia] Campo `advertencia` (ej. "pocos textos para analizar").
 * @param {Record<string, unknown>} [props.modelos] Campo `modelos`: qué modelo hizo cada tarea.
 */
export function NotaMetodologica({ nota, advertencia, modelos }) {
  const listaModelos = Object.entries(modelos ?? {});

  return (
    <section className="space-y-3">
      {/* La advertencia va primero y resaltada: afecta a cómo se leen todos los gráficos. */}
      {advertencia && (
        <div role="note" className="rounded-2xl border border-amber-400/40 bg-amber-950/30 p-4 text-sm text-amber-100">
          <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-amber-300 uppercase">⚠ Advertencia</p>
          <p className="mt-1">{advertencia}</p>
        </div>
      )}

      <div className="panel p-4 text-sm">
        <h4 className="font-semibold text-white">Nota metodológica</h4>
        {nota && <p className="mt-1 text-slate-300">{nota}</p>}

        {listaModelos.length > 0 && (
          <>
            <p className="etiqueta-hud mt-3">Modelos usados</p>
            <dl className="mt-1 space-y-1.5">
              {listaModelos.map(([tarea, modelo]) => (
                <div key={tarea} className="flex flex-col sm:flex-row sm:gap-2">
                  <dt className="shrink-0 text-slate-400 capitalize">{tarea.replaceAll("_", " ")}</dt>
                  {/* break-all: los nombres de Hugging Face son largos y sin espacios. */}
                  <dd className="font-mono text-xs break-all text-cyan-200 sm:pt-0.5">{textoModelo(modelo)}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
    </section>
  );
}
