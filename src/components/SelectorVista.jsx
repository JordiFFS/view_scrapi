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
    <div role="tablist" className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
      {opciones.map(({ id, etiqueta }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={valor === id}
          onClick={() => onCambiar(id)}
          className={`flex-1 rounded-lg px-1 py-2 text-xs font-medium transition sm:text-sm ${
            valor === id
              ? "bg-gradient-to-r from-pink-600/80 to-violet-600/80 text-white shadow-[0_0_14px_rgb(236_72_153/0.35)]"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          {etiqueta}
        </button>
      ))}
    </div>
  );
}
