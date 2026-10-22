// Componentes visuales: reciben datos por props y no hacen peticiones a la API.
// La subcarpeta analisis/ tiene su propio index.js y no se reexporta aquí a propósito:
// PaginaPerfil la carga con lazy() para que recharts no entre en el JavaScript inicial.
// inspector/ sí se reexporta: no usa librerías pesadas.
export * from "./BuscadorPerfil";
export * from "./BuscadorTema";
export * from "./CampoNumero";
export * from "./Cargando";
export * from "./GraficoBarras";
export * from "./IndicadorAPI";
export * from "./InfoResultado";
export * from "./Introduccion";
export * from "./inspector";
export * from "./ListaResultados";
export * from "./ListaVideos";
export * from "./MensajeError";
export * from "./MonitorExtraccion";
export * from "./NumeroAnimado";
export * from "./PanelEstadisticas";
export * from "./ResumenBusqueda";
export * from "./SelectorVista";
export * from "./TablaVideos";
export * from "./TarjetaPerfil";
export * from "./TarjetaVideo";
export * from "./TextoRotativo";
export * from "./VistaPreviaPeticion";
