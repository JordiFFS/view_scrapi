import { useState } from "react";
import {
  BuscadorPerfil,
  Cargando,
  ListaVideos,
  MensajeError,
  PanelEstadisticas,
  SelectorVista,
  TarjetaPerfil,
} from "../components";
import { usePerfil } from "../hooks";

const VISTAS = [
  { id: "estadisticas", etiqueta: "Estadísticas" },
  { id: "videos", etiqueta: "Videos" },
];

/**
 * Pantalla "Perfil": buscador + perfil + estadísticas o videos.
 * Conecta usePerfil con los componentes; muestra carga, error o resultado (uno a la vez).
 */
export function PaginaPerfil() {
  const { datos, cargando, error, progreso, buscar } = usePerfil();
  const [vista, setVista] = useState("estadisticas");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <p className="mb-3 text-sm text-slate-600">
          Escribe un usuario de TikTok para ver su perfil y sus videos.
        </p>
        <BuscadorPerfil onBuscar={buscar} cargando={cargando} />
      </section>

      {cargando && <Cargando progreso={progreso} />}
      {!cargando && error && <MensajeError mensaje={error} />}
      {!cargando && datos && (
        <>
          <TarjetaPerfil
            perfil={datos.perfil}
            desdeCache={datos.desde_cache}
            fechaExtraccion={datos.fecha_extraccion}
          />
          <SelectorVista opciones={VISTAS} valor={vista} onCambiar={setVista} />
          {vista === "estadisticas" ? (
            <PanelEstadisticas
              videos={datos.videos}
              nombre={datos.perfil?.usuario ?? "perfil"}
              datosCompletos={datos}
            />
          ) : (
            <ListaVideos videos={datos.videos} />
          )}
        </>
      )}
    </div>
  );
}
