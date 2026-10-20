/**
 * Convierte el texto de un CampoNumero en un entero dentro de los límites.
 * Si está vacío o no es un número, devuelve el valor por defecto.
 *
 * @param {string} texto
 * @param {{ minimo: number, maximo: number, porDefecto: number }} limites
 * @returns {number}
 */
export function limitar(texto, { minimo, maximo, porDefecto }) {
  const n = Number.parseInt(texto, 10);
  if (Number.isNaN(n)) return porDefecto;
  return Math.min(maximo, Math.max(minimo, n));
}

/**
 * Campo numérico con etiqueta y rango visible. Guarda el valor como texto
 * (para poder borrarlo mientras se escribe); se valida con `limitar` al enviar.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.etiqueta
 * @param {string} props.valor
 * @param {(texto: string) => void} props.onCambiar
 * @param {{ minimo: number, maximo: number }} props.limites
 * @param {boolean} [props.disabled]
 */
export function CampoNumero({ id, etiqueta, valor, onCambiar, limites, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {etiqueta}{" "}
        <span className="font-normal text-slate-400">
          ({limites.minimo}–{limites.maximo})
        </span>
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={limites.minimo}
        max={limites.maximo}
        step={1}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}
