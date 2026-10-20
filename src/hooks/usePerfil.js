/**
 * Estado de la pantalla de perfil: extrae un perfil de TikTok con el flujo de extracciones.
 * Devuelve { datos, cargando, error, progreso, buscar(usuario, opciones) }.
 * Las opciones son las de `crearExtraccionPerfil` (api/tiktok.js).
 */
import { useCallback } from "react";
import { crearExtraccionPerfil } from "../api";
import { useExtraccion } from "./useExtraccion";

export function usePerfil() {
  const { ejecutar, ...estado } = useExtraccion();

  const buscar = useCallback(
    (usuario, opciones) => ejecutar(() => crearExtraccionPerfil(usuario, opciones)),
    [ejecutar],
  );

  return { ...estado, buscar };
}
