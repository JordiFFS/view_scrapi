/**
 * Anima un número desde su valor anterior hasta `objetivo` (efecto "contador").
 * Se usa en los indicadores para que los datos "entren" al cargar un resultado.
 *
 * Si el sistema pide reducir movimiento, devuelve el valor final sin animar.
 */
import { useEffect, useRef, useState } from "react";

const reducirMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * @param {number | null | undefined} objetivo
 * @param {number} [duracionMs]
 * @returns {number | null | undefined} El valor a mostrar en este cuadro.
 */
export function useNumeroAnimado(objetivo, duracionMs = 900) {
  const [valor, setValor] = useState(() => (reducirMovimiento() ? objetivo : 0));
  const desde = useRef(0);

  useEffect(() => {
    if (objetivo === null || objetivo === undefined || !Number.isFinite(objetivo) || reducirMovimiento()) {
      setValor(objetivo);
      return undefined;
    }
    const inicioAnimacion = performance.now();
    const origen = desde.current;
    let cuadro;

    // requestAnimationFrame: un paso por cada repintado de la pantalla (~60 por segundo).
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicioAnimacion) / duracionMs);
      // Curva "ease-out": rápido al principio y suave al final.
      const suave = 1 - (1 - t) ** 3;
      const actual = origen + (objetivo - origen) * suave;
      setValor(actual);
      desde.current = actual;
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [objetivo, duracionMs]);

  return valor;
}
