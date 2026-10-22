import { lazy, Suspense, useState } from "react";
import {
  BuscadorPerfil,
  Cargando,
  ConsolaRegistro,
  InspectorDatos,
  Introduccion,
  ListaVideos,
  MensajeError,
  MonitorExtraccion,
  PanelEstadisticas,
  SelectorVista,
  TarjetaPerfil,
} from "../components";
import { useAnalisis, usePerfil } from "../hooks";

// Carga diferida: el código de PanelAnalisis (y de recharts, que pesa ~450 kB) se descarga
// solo la primera vez que se abre la vista "Análisis IA", no al abrir la app.
// lazy() espera un export default, por eso se adapta el export con nombre.
const PanelAnalisis = lazy(() =>
  import("../components/analisis").then((modulo) => ({ default: modulo.PanelAnalisis })),
);

const VISTAS = [
  { id: "estadisticas", etiqueta: "Estadísticas" },
  { id: "videos", etiqueta: "Videos" },
  { id: "analisis", etiqueta: "Análisis IA" },
  { id: "datos", etiqueta: "Datos" },
];

/**
 * Pantalla "Perfil": buscador + perfil + estadísticas, videos, análisis con IA o datos crudos.
 * Conecta usePerfil y useAnalisis con los componentes; muestra carga, error o resultado (uno a la vez).
 */
export function PaginaPerfil() {
  const { datos, cargando, error, progreso, registro, metricas, buscar } = usePerfil();
  const analisis = useAnalisis();
  const [vista, setVista] = useState("estadisticas");
  // Usuario y opciones de la última búsqueda: el análisis se pide con los mismos parámetros.
  const [ultimaBusqueda, setUltimaBusqueda] = useState(null);

  // Al buscar otro perfil se guarda la búsqueda y se descarta el análisis del perfil anterior.
  function manejarBusqueda(usuario, opciones) {
    setUltimaBusqueda({ usuario, opciones });
    analisis.limpiar();
    buscar(usuario, opciones);
  }

  // El botón "Analizar con IA" llama aquí. `refrescar` lo decide el panel y no se hereda de la
  // búsqueda: el perfil se acaba de extraer, así que el backend puede reutilizar su caché.
  function manejarAnalisis({ refrescar }) {
    if (!ultimaBusqueda) return;
    analisis.analizar(ultimaBusqueda.usuario, { ...ultimaBusqueda.opciones, refrescar });
  }

  const usuario = datos?.perfil?.usuario ?? ultimaBusqueda?.usuario ?? "";

  return (
    <div className="space-y-5">
      <Introduccion
        etiqueta="nueva extracción · perfil"
        titulo="¿Qué perfil quieres escanear?"
        texto="Escribe un usuario de TikTok. La API abre un navegador real, recorre su perfil y te devuelve sus videos, métricas y comentarios."
      >
        <BuscadorPerfil onBuscar={manejarBusqueda} cargando={cargando} />
      </Introduccion>

      {cargando && <MonitorExtraccion progreso={progreso} registro={registro} tipo="perfil" />}
      {!cargando && error && (
        <>
          <MensajeError mensaje={error} />
          {/* El registro muestra en qué paso falló. */}
          <ConsolaRegistro registro={registro} titulo="extraccion-perfil.log" />
        </>
      )}
      {!cargando && datos && (
        <>
          <TarjetaPerfil
            perfil={datos.perfil}
            desdeCache={datos.desde_cache}
            fechaExtraccion={datos.fecha_extraccion}
          />
          <SelectorVista opciones={VISTAS} valor={vista} onCambiar={setVista} />
          {vista === "estadisticas" && (
            <PanelEstadisticas videos={datos.videos} nombre={usuario || "perfil"} datosCompletos={datos} />
          )}
          {vista === "videos" && <ListaVideos videos={datos.videos} />}
          {vista === "analisis" && (
            // Mientras llega el código del panel se muestra el mismo indicador de carga.
            <Suspense fallback={<Cargando titulo="Cargando el módulo de análisis..." detalle="" />}>
              <PanelAnalisis
                usuario={usuario}
                analisis={analisis.analisis}
                cargando={analisis.cargando}
                error={analisis.error}
                inicio={analisis.inicio}
                onAnalizar={manejarAnalisis}
              />
            </Suspense>
          )}
          {vista === "datos" && (
            <InspectorDatos
              tipo="perfil"
              datos={datos}
              registro={registro}
              metricas={metricas}
              nombre={usuario || "perfil"}
            />
          )}
        </>
      )}
    </div>
  );
}
