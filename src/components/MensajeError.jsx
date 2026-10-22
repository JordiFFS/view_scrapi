/**
 * Caja de error. El mensaje ya viene en español desde client.js o desde la extracción.
 *
 * @param {object} props
 * @param {string} props.mensaje
 */
export function MensajeError({ mensaje }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-100 shadow-[0_0_24px_rgb(244_63_94/0.15)]"
    >
      <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-rose-400 uppercase">
        <span aria-hidden="true">✕</span> Error en la extracción
      </p>
      <p className="mt-1.5">{mensaje}</p>
    </div>
  );
}
