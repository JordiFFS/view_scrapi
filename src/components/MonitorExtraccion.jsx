import { Cargando } from "./Cargando";
import { ConsolaRegistro, etapaDesdeProgreso, PipelineDatos } from "./inspector";

/**
 * Lo que se ve mientras corre una extracción: la ilustración animada (Cargando), el recorrido
 * de los datos con la etapa actual encendida y la consola con las peticiones en vivo.
 *
 * @param {object} props
 * @param {{ estado: string, posicionEnCola: number | null } | null} props.progreso
 * @param {{ ms: number, nivel: string, texto: string }[]} props.registro
 * @param {"perfil" | "busqueda"} props.tipo
 */
export function MonitorExtraccion({ progreso, registro, tipo }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Cargando progreso={progreso} tipo={tipo} />
        <ConsolaRegistro registro={registro} activo titulo={`extraccion-${tipo}.log`} />
      </div>
      <PipelineDatos activa={etapaDesdeProgreso(progreso)} />
    </div>
  );
}
