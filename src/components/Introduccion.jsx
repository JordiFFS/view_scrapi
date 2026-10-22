/**
 * Encabezado de cada página con el formulario: etiqueta de consola, título y texto de ayuda.
 *
 * @param {object} props
 * @param {string} props.etiqueta Texto pequeño en mayúsculas (ej. "nueva extracción · perfil").
 * @param {string} props.titulo
 * @param {string} props.texto
 * @param {import("react").ReactNode} props.children El formulario.
 */
export function Introduccion({ etiqueta, titulo, texto, children }) {
  return (
    <section className="panel esquinas p-4 sm:p-5">
      <p className="etiqueta-hud">// {etiqueta}</p>
      <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
        {titulo}
        {/* Cursor de terminal al final del título. */}
        <span aria-hidden="true" className="ml-1 inline-block h-5 w-2 translate-y-0.5 bg-pink-500 motion-safe:animate-parpadeo" />
      </h2>
      <p className="mt-1 mb-4 text-sm text-slate-400">{texto}</p>
      {children}
    </section>
  );
}
