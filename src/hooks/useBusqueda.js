/**
 * Estado de la pantalla de búsqueda por tema, con el flujo de extracciones.
 * Devuelve { datos, cargando, error, progreso, buscar(q, opciones) }.
 * Las opciones son las de `crearExtraccionBusqueda` (api/tiktok.js).
 */
import { useCallback } from "react";
import { crearExtraccionBusqueda } from "../api";
import { useExtraccion } from "./useExtraccion";

export function useBusqueda() {
  const { ejecutar, ...estado } = useExtraccion();

  const buscar = useCallback(
    (q, opciones) => ejecutar(() => crearExtraccionBusqueda(q, opciones)),
    [ejecutar],
  );

  return { ...estado, buscar };
}
