import { useState } from "react";
import {
  BuscadorTema,
  Cargando,
  ListaResultados,
  MensajeError,
  PanelEstadisticas,
  ResumenBusqueda,
  SelectorVista,
} from "../components";
import { useBusqueda } from "../hooks";

const VISTAS = [
  { id: "estadisticas", etiqueta: "Estadísticas" },
  { id: "videos", etiqueta: "Videos" },
];

/**
 * Pantalla "Buscar por tema": buscador + resumen + estadísticas o resultados ordenados.
 * Conecta useBusqueda con los componentes; muestra carga, error o resultado (uno a la vez).
 */
export function PaginaBusqueda() {
  const { datos, cargando, error, progreso, buscar } = useBusqueda();
  const [vista, setVista] = useState("estadisticas");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="mb-3 text-sm text-slate-600">
          Escribe un tema para encontrar los mejores videos de TikTok sobre él.
        </p>
        <BuscadorTema onBuscar={buscar} cargando={cargando} />
      </section>

      {cargando && <Cargando progreso={progreso} />}
      {!cargando && error && <MensajeError mensaje={error} />}
      {!cargando && datos && (
        <>
          <ResumenBusqueda busqueda={datos} />
          <SelectorVista opciones={VISTAS} valor={vista} onCambiar={setVista} />
          {vista === "estadisticas" ? (
            <PanelEstadisticas
              videos={datos.resultados}
              nombre={datos.consulta ?? "busqueda"}
              datosCompletos={datos}
            />
          ) : (
            <ListaResultados resultados={datos.resultados} />
          )}
        </>
      )}
    </div>
  );
}
