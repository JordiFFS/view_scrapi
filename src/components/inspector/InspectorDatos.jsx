import { useMemo } from "react";
import {
  contarComentarios,
  descargarJSON,
  estructuraJSON,
  filasDeVideos,
  formatearBytes,
  formatearDuracion,
  formatearNumero,
  METRICAS,
  nombreArchivo,
  tamanoJSON,
} from "../../utils";
import { ArbolJSON } from "./ArbolJSON";
import { ConsolaRegistro } from "./ConsolaRegistro";
import { PipelineDatos } from "./PipelineDatos";
import { TransformacionDatos } from "./TransformacionDatos";

// Un dato de la fila de medidas, con estilo de consola.
function Medida({ etiqueta, valor, detalle }) {
  return (
    <div className="panel px-3 py-2.5">
      <p className="etiqueta-hud !text-[9px]">{etiqueta}</p>
      <p className="mt-1 font-mono text-lg font-bold text-white">{valor}</p>
      {detalle && <p className="text-[11px] text-slate-500">{detalle}</p>}
    </div>
  );
}

/**
 * Vista "Datos": muestra cómo se obtuvo y cómo se trata la información de una consulta.
 *
 *   1. Medidas del JSON recibido (tamaño, campos, profundidad, tiempo, consultas).
 *   2. Recorrido de los datos con un dato real en cada etapa.
 *   3. Registro de la extracción (las peticiones que hizo el navegador).
 *   4. Transformación de un video: JSON anidado -> fila plana.
 *   5. El JSON completo en un árbol plegable, con opción de descargarlo.
 *
 * @param {object} props
 * @param {"perfil" | "busqueda"} props.tipo
 * @param {object} props.datos Respuesta completa (`resultado` de la extracción).
 * @param {{ ms: number, nivel: string, texto: string }[]} props.registro
 * @param {{ duracionMs: number | null, consultas: number, bytes: number | null } | null} props.metricas
 * @param {string} props.nombre Usuario o tema, para el nombre del archivo descargado.
 */
export function InspectorDatos({ tipo, datos, registro, metricas, nombre }) {
  // Recorrer todo el JSON cuesta: se calcula solo cuando cambian los datos.
  const calculo = useMemo(() => {
    const lista = (tipo === "perfil" ? datos.videos : datos.resultados) ?? [];
    return {
      videos: lista,
      estructura: estructuraJSON(datos),
      filas: filasDeVideos(lista),
      bytes: metricas?.bytes ?? tamanoJSON(datos),
    };
  }, [tipo, datos, metricas?.bytes]);
  const { videos, estructura, filas, bytes } = calculo;

  // Un dato real por etapa del recorrido.
  const medidas = {
    fuente: tipo === "perfil" ? `@${datos.perfil?.usuario ?? nombre}` : `"${datos.consulta ?? nombre}"`,
    scraper:
      tipo === "perfil"
        ? `${videos.length} videos · ${contarComentarios(videos)} coment.`
        : `${formatearNumero(datos.total_candidatos)} candidatos`,
    api: `${datos.desde_cache ? "desde caché" : "extracción nueva"} · ${metricas?.consultas ?? 0} consultas`,
    navegador: `${formatearBytes(bytes)} → ${filas.length} filas`,
    graficos: `${METRICAS.length + 1} métricas por video`,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Medida etiqueta="Tamaño JSON" valor={formatearBytes(bytes)} detalle="UTF-8, sin comprimir" />
        <Medida etiqueta="Campos" valor={formatearNumero(estructura.claves)} detalle={`${estructura.valores} valores`} />
        <Medida etiqueta="Profundidad" valor={`${estructura.profundidad} niveles`} detalle={`${estructura.arreglos} listas`} />
        <Medida etiqueta="Tiempo total" valor={formatearDuracion(metricas?.duracionMs)} detalle="POST + consultas" />
        <Medida etiqueta="Consultas GET" valor={metricas?.consultas ?? 0} detalle="al estado de la extracción" />
        <Medida etiqueta="Origen" valor={datos.desde_cache ? "Caché" : "En vivo"} detalle="según la API" />
      </div>

      <PipelineDatos medidas={medidas} />

      <ConsolaRegistro registro={registro} titulo={`extraccion-${tipo}.log`} />

      {videos.length > 0 && <TransformacionDatos video={videos[0]} fila={filas[0]} />}

      <section className="panel p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="etiqueta-hud">// respuesta completa</p>
            <h4 className="mt-1 font-semibold text-white">JSON recibido de la API</h4>
            <p className="text-xs text-slate-400">Toca una llave para abrir o cerrar ese nivel.</p>
          </div>
          <button type="button" onClick={() => descargarJSON(datos, nombreArchivo(nombre))} className="boton-borde">
            Descargar JSON
          </button>
        </div>
        <div className="mt-3 max-h-[28rem] overflow-auto rounded-xl border border-white/10 bg-black/40 py-2 pr-3 font-mono text-[11px] leading-relaxed sm:text-xs">
          <ArbolJSON datos={datos} nombre="resultado" abrirHasta={2} />
        </div>
      </section>
    </div>
  );
}
