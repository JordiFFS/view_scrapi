// Cuántos elementos de un arreglo se muestran antes de resumir el resto ("… y 25 más").
const MAX_ELEMENTOS = 12;
// Los textos muy largos (ej. URLs de portadas) se recortan para no romper el diseño.
const MAX_TEXTO = 90;

// Valor final (hoja del árbol) con un color por tipo, como en un editor de código.
function Valor({ valor }) {
  if (valor === null) return <span className="text-slate-500">null</span>;
  if (typeof valor === "string") {
    const corto = valor.length > MAX_TEXTO ? `${valor.slice(0, MAX_TEXTO)}…` : valor;
    return (
      <span className="break-all text-emerald-300" title={valor.length > MAX_TEXTO ? valor : undefined}>
        "{corto}"
      </span>
    );
  }
  if (typeof valor === "number") return <span className="text-amber-300">{valor}</span>;
  if (typeof valor === "boolean") return <span className="text-violet-300">{String(valor)}</span>;
  return <span className="text-slate-400">{String(valor)}</span>;
}

/**
 * Visor de JSON plegable. Cada objeto o arreglo es un <details> nativo del navegador:
 * se abre y cierra con un clic o con el teclado, sin estado de React.
 *
 * Es recursivo: un nodo con hijos se dibuja a sí mismo para cada hijo, un nivel más adentro.
 *
 * @param {object} props
 * @param {unknown} props.datos
 * @param {string} [props.nombre] Clave o índice de este nodo.
 * @param {number} [props.nivel] Profundidad actual (0 = raíz).
 * @param {number} [props.abrirHasta] Los niveles menores a este empiezan abiertos.
 */
export function ArbolJSON({ datos, nombre, nivel = 0, abrirHasta = 1 }) {
  const etiqueta = nombre !== undefined && <span className="text-sky-300">{nombre}: </span>;
  const esArreglo = Array.isArray(datos);

  // Hoja: texto, número, booleano o null.
  if (datos === null || typeof datos !== "object") {
    return (
      <div className="py-0.5 pl-4">
        {etiqueta}
        <Valor valor={datos} />
      </div>
    );
  }

  const entradas = esArreglo ? datos.map((v, i) => [i, v]) : Object.entries(datos);
  const visibles = esArreglo ? entradas.slice(0, MAX_ELEMENTOS) : entradas;
  const resumen = esArreglo ? `[${datos.length}]` : `{${entradas.length}}`;

  return (
    <details open={nivel < abrirHasta} className="pl-4 [&>summary::-webkit-details-marker]:hidden">
      <summary className="-ml-4 cursor-pointer list-none rounded py-0.5 hover:bg-white/5">
        {/* El triángulo gira solo si SU <details> está abierto. Con `group-open` también giraría
            dentro de cualquier ancestro abierto; este selector mira únicamente al padre directo. */}
        <span
          aria-hidden="true"
          className="inline-block w-4 text-slate-500 transition [details[open]>summary>&]:rotate-90"
        >
          ▸
        </span>
        {etiqueta}
        <span className="text-slate-500">{resumen}</span>
      </summary>
      <div className="border-l border-white/10">
        {visibles.map(([clave, valor]) => (
          <ArbolJSON key={clave} datos={valor} nombre={String(clave)} nivel={nivel + 1} abrirHasta={abrirHasta} />
        ))}
        {entradas.length > visibles.length && (
          <div className="py-0.5 pl-4 text-slate-500">… y {entradas.length - visibles.length} más</div>
        )}
      </div>
    </details>
  );
}
