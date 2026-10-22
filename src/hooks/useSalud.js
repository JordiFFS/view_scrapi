/**
 * Estado de conexión con la API para el indicador de la cabecera.
 *
 * Llama a GET /api/salud al abrir la app y luego cada 30 segundos, y mide cuánto tarda
 * (latencia). Devuelve { estado, latenciaMs, comprobar }:
 *   estado: "comprobando" | "en_linea" | "sin_conexion"
 */
import { useCallback, useEffect, useState } from "react";
import { obtenerSalud } from "../api";

const CADA_MS = 30000;

export function useSalud() {
  const [estado, setEstado] = useState("comprobando");
  const [latenciaMs, setLatenciaMs] = useState(null);

  const comprobar = useCallback(async () => {
    const inicio = performance.now();
    try {
      await obtenerSalud();
      setLatenciaMs(Math.round(performance.now() - inicio));
      setEstado("en_linea");
    } catch {
      // Cualquier fallo (API apagada, URL incorrecta, CORS) se muestra igual: sin conexión.
      setLatenciaMs(null);
      setEstado("sin_conexion");
    }
  }, []);

  useEffect(() => {
    // Primera comprobación al montar y luego una periódica; se limpia al desmontar.
    comprobar();
    const intervalo = setInterval(comprobar, CADA_MS);
    return () => clearInterval(intervalo);
  }, [comprobar]);

  return { estado, latenciaMs, comprobar };
}
