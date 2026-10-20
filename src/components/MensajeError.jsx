/**
 * Caja de error. El mensaje ya viene en español desde client.js o desde la extracción.
 *
 * @param {object} props
 * @param {string} props.mensaje
 */
export function MensajeError({ mensaje }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">Ocurrió un error</p>
      <p className="mt-1">{mensaje}</p>
    </div>
  );
}
