/**
 * Control segmentado para elegir qué se muestra de un resultado (ej. "Estadísticas" o "Videos").
 *
 * @param {object} props
 * @param {{ id: string, etiqueta: string }[]} props.opciones
 * @param {string} props.valor Id de la opción activa.
 * @param {(id: string) => void} props.onCambiar
 */
export function SelectorVista({ opciones, valor, onCambiar }) {
  return (
    <div role="tablist" className="flex rounded-xl bg-slate-200 p-1">
      {opciones.map(({ id, etiqueta }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={valor === id}
          onClick={() => onCambiar(id)}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            valor === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {etiqueta}
        </button>
      ))}
    </div>
  );
}
