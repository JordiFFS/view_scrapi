import { useState } from "react";
import {
  BuscadorTema,
  ConsolaRegistro,
  InspectorDatos,
  Introduccion,
  ListaResultados,
  MensajeError,
  MonitorExtraccion,
  PanelEstadisticas,
  ResumenBusqueda,
  SelectorVista,
} from "../components";
import { useBusqueda } from "../hooks";

const VISTAS = [
  { id: "estadisticas", etiqueta: "Estadísticas" },
  { id: "videos", etiqueta: "Videos" },
  { id: "datos", etiqueta: "Datos" },
];

/**
 * Pantalla "Buscar por tema": buscador + resumen + estadísticas, resultados o datos crudos.
 * Conecta useBusqueda con los componentes; muestra carga, error o resultado (uno a la vez).
 */
export function PaginaBusqueda() {
  const { datos, cargando, error, progreso, registro, metricas, buscar } = useBusqueda();
  const [vista, setVista] = useState("estadisticas");

  return (
    <div className="space-y-5">
      <Introduccion
        etiqueta="nueva extracción · tema"
        titulo="¿Sobre qué tema buscamos?"
        texto="La API convierte tu tema en hashtags, reúne videos candidatos y los ordena por relevancia, interacción y alcance."
      >
        <BuscadorTema onBuscar={buscar} cargando={cargando} />
      </Introduccion>

      {cargando && <MonitorExtraccion progreso={progreso} registro={registro} tipo="busqueda" />}
      {!cargando && error && (
        <>
          <MensajeError mensaje={error} />
          <ConsolaRegistro registro={registro} titulo="extraccion-busqueda.log" />
        </>
      )}
      {!cargando && datos && (
        <>
          <ResumenBusqueda busqueda={datos} />
          <SelectorVista opciones={VISTAS} valor={vista} onCambiar={setVista} />
          {vista === "estadisticas" && (
            <PanelEstadisticas
              videos={datos.resultados}
              nombre={datos.consulta ?? "busqueda"}
              datosCompletos={datos}
            />
          )}
          {vista === "videos" && <ListaResultados resultados={datos.resultados} />}
          {vista === "datos" && (
            <InspectorDatos
              tipo="busqueda"
              datos={datos}
              registro={registro}
              metricas={metricas}
              nombre={datos.consulta ?? "busqueda"}
            />
          )}
        </>
      )}
    </div>
  );
}
