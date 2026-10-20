/**
 * Hook genérico para el flujo de extracciones asíncronas de la API.
 *
 *   1. `crear()` hace el POST a /api/extracciones y la API responde al instante con un id.
 *   2. Se consulta GET /api/extracciones/{id} cada `consultar_de_nuevo_en_seg` segundos.
 *   3. Al llegar a "completada" se guarda `resultado`; si llega "error", se muestra el detalle.
 *
 * Lo usan usePerfil y useBusqueda, que solo cambian la función que crea la extracción.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { consultarExtraccion } from "../api";

// Se usa si la API no indica cada cuánto volver a consultar.
const ESPERA_POR_DEFECTO_SEG = 3;
// Margen por encima de los 3 min que puede tardar la API, contando la espera en cola.
const ESPERA_MAXIMA_MS = 10 * 60 * 1000;

const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

/**
 * @returns {{
 *   datos: object | null,        resultado de la extracción completada
 *   cargando: boolean,
 *   error: string | null,        mensaje listo para mostrar
 *   progreso: { estado: string, posicionEnCola: number | null } | null,
 *   ejecutar: (crear: () => Promise<object>) => Promise<void>,
 * }}
 */
export function useExtraccion() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  // Estado de la extracción en curso: { estado, posicionEnCola }
  const [progreso, setProgreso] = useState(null);

  // Cada ejecución recibe un número; si empieza otra (o se desmonta el componente),
  // la anterior deja de consultar y no pisa el estado.
  const ejecucionActual = useRef(0);
  useEffect(() => () => void ejecucionActual.current++, []);

  const ejecutar = useCallback(async (crear) => {
    const id = ++ejecucionActual.current;
    const vigente = () => id === ejecucionActual.current;

    setCargando(true);
    setError(null);
    setDatos(null);

    try {
      let extraccion = await crear();
      const limite = Date.now() + ESPERA_MAXIMA_MS;

      // Si el resultado ya estaba en caché, la extracción llega "completada" y no se entra al bucle.
      while (vigente() && (extraccion.estado === "pendiente" || extraccion.estado === "en_proceso")) {
        setProgreso({ estado: extraccion.estado, posicionEnCola: extraccion.posicion_en_cola });
        if (Date.now() > limite) {
          throw new Error("La extracción está tardando demasiado. Intenta de nuevo más tarde.");
        }
        await pausa((extraccion.consultar_de_nuevo_en_seg ?? ESPERA_POR_DEFECTO_SEG) * 1000);
        if (!vigente()) return;
        extraccion = await consultarExtraccion(extraccion.id);
      }

      if (!vigente()) return;
      if (extraccion.estado === "error") {
        throw new Error(extraccion.error?.detalle || "La extracción falló.");
      }
      setDatos(extraccion.resultado);
    } catch (err) {
      // Los errores HTTP ya vienen con mensaje legible desde el interceptor de client.js.
      if (vigente()) setError(err.message);
    } finally {
      if (vigente()) {
        setCargando(false);
        setProgreso(null);
      }
    }
  }, []);

  return { datos, cargando, error, progreso, ejecutar };
}
