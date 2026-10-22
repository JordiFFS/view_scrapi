/**
 * Muestra, antes de enviar, la petición HTTP exacta que el formulario va a mandar a la API.
 * Sirve para ver cómo se traducen los campos del formulario (camelCase) al JSON que espera
 * FastAPI (snake_case). Las claves sin valor no se envían, igual que en api/tiktok.js.
 *
 * @param {object} props
 * @param {string} props.metodo "POST" o "GET".
 * @param {string} props.ruta Ej. "/api/extracciones".
 * @param {Record<string, unknown>} props.cuerpo Lo que se enviará en el body.
 */
export function VistaPreviaPeticion({ metodo, ruta, cuerpo }) {
  // Igual que JSON.stringify: las claves con undefined desaparecen.
  const entradas = Object.entries(cuerpo).filter(([, v]) => v !== undefined);

  return (
    <details className="group rounded-xl border border-white/10 bg-black/30 [&>summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-mono text-[11px] text-slate-400 hover:text-slate-200">
        <span aria-hidden="true" className="transition group-open:rotate-90">▸</span>
        Ver la petición que se enviará
      </summary>
      <pre className="overflow-x-auto border-t border-white/10 px-3 py-2.5 font-mono text-[11px] leading-relaxed">
        <span className="font-bold text-pink-400">{metodo}</span> <span className="text-cyan-300">{ruta}</span>
        {"\n"}
        <span className="text-slate-500">Content-Type: application/json</span>
        {"\n\n{\n"}
        {entradas.map(([clave, valor], i) => (
          <span key={clave}>
            {"  "}
            <span className="text-sky-300">"{clave}"</span>:{" "}
            <span className={typeof valor === "string" ? "text-emerald-300" : "text-amber-300"}>
              {JSON.stringify(valor)}
            </span>
            {i < entradas.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {"}"}
      </pre>
    </details>
  );
}
