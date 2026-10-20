// Texto según el estado que informa la API: pendiente (en cola) o en_proceso.
function textoProgreso(progreso) {
  if (!progreso) return "Enviando solicitud...";
  if (progreso.estado === "pendiente") {
    return progreso.posicionEnCola
      ? `En cola: posición ${progreso.posicionEnCola}`
      : "En cola, esperando turno...";
  }
  return "Extrayendo datos de TikTok...";
}

/**
 * Indicador de carga con el estado de la extracción.
 *
 * @param {object} props
 * @param {{ estado: string, posicionEnCola: number | null } | null} props.progreso
 *   null mientras se envía el POST; luego lo actualiza useExtraccion.
 */
export function Cargando({ progreso }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-pink-600" />
      <p className="font-medium text-slate-800">{textoProgreso(progreso)}</p>
      <p className="text-sm text-slate-600">Esto puede tardar hasta 3 minutos...</p>
    </div>
  );
}
