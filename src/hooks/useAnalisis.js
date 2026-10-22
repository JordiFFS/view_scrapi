/**
 * Estado del análisis con IA de un perfil (GET /api/analisis/{usuario}).
 *
 * A diferencia de usePerfil, aquí no hay extracciones con consultas periódicas: es una sola
 * petición larga (hasta 6 minutos) que devuelve el análisis completo.
 *
 * Devuelve { analisis, cargando, error, inicio, analizar(usuario, opciones), limpiar() }.
 * `inicio` es la hora (Date.now()) en que empezó la petición actual, para mostrar el tiempo
 * transcurrido aunque el panel se oculte y vuelva a aparecer.
 * Las opciones son las de `obtenerAnalisis` (api/analisis.js).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerAnalisis } from "../api";

export function useAnalisis() {
  const [analisis, setAnalisis] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [inicio, setInicio] = useState(null);

  // Igual que en useExtraccion: cada petición recibe un número. Si empieza otra, se llama a
  // `limpiar` o se desmonta el componente, la respuesta vieja se ignora y no pisa el estado.
  const peticionActual = useRef(0);
  useEffect(() => () => void peticionActual.current++, []);

  const analizar = useCallback(async (usuario, opciones) => {
    // 1. Se marca esta petición como la vigente y se reinicia el estado.
    const id = ++peticionActual.current;
    const vigente = () => id === peticionActual.current;
    setCargando(true);
    setError(null);
    setAnalisis(null);
    setInicio(Date.now());

    try {
      // 2. La capa api hace el GET; el hook solo guarda el resultado.
      const datos = await obtenerAnalisis(usuario, opciones);
      if (vigente()) setAnalisis(datos);
    } catch (err) {
      // 3. El mensaje ya viene en español desde el interceptor de client.js.
      if (vigente()) setError(err.message);
    } finally {
      if (vigente()) setCargando(false);
    }
  }, []);

  // Descarta el análisis (y cualquier petición en curso), por ejemplo al buscar otro perfil.
  const limpiar = useCallback(() => {
    peticionActual.current++;
    setAnalisis(null);
    setError(null);
    setCargando(false);
  }, []);

  return { analisis, cargando, error, inicio, analizar, limpiar };
}
