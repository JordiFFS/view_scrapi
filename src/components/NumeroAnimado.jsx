import { useNumeroAnimado } from "../hooks";

/**
 * Número que "cuenta" hasta su valor al aparecer (efecto contador) y luego se formatea.
 * El valor final va en un texto oculto (sr-only), así el lector de pantalla no lee cada paso.
 *
 * @param {object} props
 * @param {number | null | undefined} props.valor
 * @param {(n: number | null | undefined) => string} [props.formato] Por defecto, redondeo simple.
 */
export function NumeroAnimado({ valor, formato = (n) => String(Math.round(n ?? 0)) }) {
  const actual = useNumeroAnimado(valor);
  // Sin dato no hay nada que animar: se usa el formato directo (normalmente devuelve "—").
  const texto = valor === null || valor === undefined ? formato(valor) : formato(actual);

  return (
    <span className="tabular-nums">
      <span aria-hidden="true">{texto}</span>
      <span className="sr-only">{formato(valor)}</span>
    </span>
  );
}
