/**
 * Estado de la pantalla de perfil: extrae un perfil de TikTok con el flujo de extracciones.
 * Devuelve { datos, cargando, error, progreso, registro, metricas, buscar(usuario, opciones) }.
 * Las opciones son las de `crearExtraccionPerfil` (api/tiktok.js).
 */
import { useCallback } from "react";
import { crearExtraccionPerfil } from "../api";
import { useExtraccion } from "./useExtraccion";

export function usePerfil() {
  const { ejecutar, ...estado } = useExtraccion();

  const buscar = useCallback(
    (usuario, opciones) =>
      ejecutar(
        () => crearExtraccionPerfil(usuario, opciones),
        // Primera línea de la consola: qué se le pide a la API.
        `POST /api/extracciones · perfil @${usuario.trim().replace(/^@/, "")}`,
      ),
    [ejecutar],
  );

  return { ...estado, buscar };
}
