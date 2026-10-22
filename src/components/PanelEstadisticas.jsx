import { lazy, Suspense, useMemo, useState } from "react";
import {
  METRICAS,
  creadoresFrecuentes,
  descargarCSV,
  descargarJSON,
  extraerHashtags,
  filasDeVideos,
  formatearFecha,
  formatearNumero,
  formatearPorcentaje,
  hashtagsFrecuentes,
  nombreArchivo,
  rendimientoPorDia,
  resumirVideos,
  tasaInteraccion,
  valorMetrica,
} from "../utils";
import { GraficoBarras } from "./GraficoBarras";
import { NumeroAnimado } from "./NumeroAnimado";
import { TablaVideos } from "./TablaVideos";

// Gráficos con recharts, cargados aparte (lazy) para que la app abra rápido.
// lazy() espera un export default, por eso se adapta cada export con nombre.
const GraficoEvolucion = lazy(() => import("./graficos").then((m) => ({ default: m.GraficoEvolucion })));
const GraficoDispersion = lazy(() => import("./graficos").then((m) => ({ default: m.GraficoDispersion })));

// Lo que se ve mientras llega el código de recharts: un panel vacío del mismo alto.
function PanelCargandoGrafico() {
  return <div className="panel h-72 animate-pulse" aria-hidden="true" />;
}

// Cuántos videos muestra el ranking.
const TOP = 10;

// Opciones del ranking: las métricas de la API más la tasa de interacción calculada.
const OPCIONES_RANKING = [
  ...METRICAS.map(({ clave, etiqueta }) => ({
    clave,
    etiqueta,
    valor: (v) => valorMetrica(v, clave),
    formato: formatearNumero,
  })),
  { clave: "tasa", etiqueta: "Tasa de interacción", valor: (v) => tasaInteraccion(v) ?? 0, formato: formatearPorcentaje },
];

// Texto corto para identificar un video en los gráficos: descripción sin hashtags o la fecha.
function etiquetaVideo(video) {
  const texto = (video.descripcion ?? "").replace(/#[\p{L}\p{N}_]+/gu, "").trim();
  return texto || `Video del ${formatearFecha(video.fecha)}`;
}

// Un indicador del encabezado del panel. El número "cuenta" hasta su valor al aparecer.
function Indicador({ etiqueta, numero, formato, detalle, destacado = false }) {
  return (
    <div className={`panel p-3 ${destacado ? "border-pink-500/40 shadow-[0_0_20px_rgb(236_72_153/0.15)]" : ""}`}>
      <p className="etiqueta-hud !text-[9px]">{etiqueta}</p>
      <p className="mt-1 font-mono text-xl font-bold text-white">
        <NumeroAnimado valor={numero} formato={formato} />
      </p>
      {detalle && <p className="mt-0.5 text-[11px] text-slate-500">{detalle}</p>}
    </div>
  );
}

/**
 * Frases automáticas con lo más llamativo de los datos: qué funciona mejor y qué no.
 * Son el punto de partida para decidir qué cambiar o mejorar.
 */
function calcularHallazgos(videos, resumen, dias, hashtags) {
  const hallazgos = [];

  const mejor = videos.reduce((a, b) => (valorMetrica(b, "vistas") > valorMetrica(a, "vistas") ? b : a));
  if (resumen.medianas.vistas > 0) {
    const veces = valorMetrica(mejor, "vistas") / resumen.medianas.vistas;
    hallazgos.push(
      `El video más visto ("${etiquetaVideo(mejor).slice(0, 50)}") tiene ${formatearNumero(
        valorMetrica(mejor, "vistas"),
      )} vistas: ${veces.toLocaleString("es-EC", { maximumFractionDigits: 1 })} veces la mediana.`,
    );
  }

  const conDatos = dias.filter((d) => d.videos > 0);
  if (conDatos.length >= 2) {
    const mejorDia = conDatos.reduce((a, b) => (b.vistasPromedio > a.vistasPromedio ? b : a));
    const peorDia = conDatos.reduce((a, b) => (b.vistasPromedio < a.vistasPromedio ? b : a));
    hallazgos.push(
      `Los videos publicados el ${mejorDia.dia.toLowerCase()} promedian ${formatearNumero(
        mejorDia.vistasPromedio,
      )} vistas; los del ${peorDia.dia.toLowerCase()}, ${formatearNumero(peorDia.vistasPromedio)}.`,
    );
  }

  // Solo hashtags repetidos: con un único video el promedio no dice mucho.
  const repetidos = hashtags.filter((h) => h.videos >= 2);
  if (repetidos.length && resumen.promedios.vistas > 0) {
    const mejorTag = repetidos.reduce((a, b) => (b.vistasPromedio > a.vistasPromedio ? b : a));
    const relacion = mejorTag.vistasPromedio / resumen.promedios.vistas;
    hallazgos.push(
      `#${mejorTag.hashtag} aparece en ${mejorTag.videos} videos y promedia ${formatearNumero(
        mejorTag.vistasPromedio,
      )} vistas (${relacion >= 1 ? "+" : ""}${formatearPorcentaje(relacion - 1)} frente al promedio general).`,
    );
  }

  if (resumen.tasaInteraccion !== null) {
    const debajo = videos.filter((v) => (tasaInteraccion(v) ?? 0) < resumen.tasaInteraccion).length;
    hallazgos.push(
      `${debajo} de ${videos.length} videos están por debajo de la tasa de interacción general (${formatearPorcentaje(
        resumen.tasaInteraccion,
      )}).`,
    );
  }

  const sinHashtags = videos.filter((v) => extraerHashtags(v.descripcion).length === 0).length;
  if (sinHashtags > 0) {
    hallazgos.push(`${sinHashtags} de ${videos.length} videos no usan hashtags en la descripción.`);
  }

  return hallazgos;
}

/**
 * Panel de estadísticas (dashboard) de una lista de videos: indicadores, hallazgos,
 * ranking por métrica, rendimiento por día, hashtags, creadores (en búsquedas),
 * tabla detallada y exportación a CSV/JSON para analizar los datos después.
 *
 * @param {object} props
 * @param {object[]} props.videos Videos del perfil o resultados de la búsqueda.
 * @param {string} props.nombre Usuario o tema; se usa en el nombre de los archivos exportados.
 * @param {object} props.datosCompletos Respuesta completa de la API, para exportar como JSON.
 */
export function PanelEstadisticas({ videos, nombre, datosCompletos }) {
  const [metrica, setMetrica] = useState("vistas");

  const calculos = useMemo(() => {
    if (!videos?.length) return null;
    const resumen = resumirVideos(videos);
    const dias = rendimientoPorDia(videos);
    const hashtags = hashtagsFrecuentes(videos);
    return {
      resumen,
      dias,
      hashtags,
      filas: filasDeVideos(videos),
      creadores: videos.some((v) => v.creador) ? creadoresFrecuentes(videos) : [],
      hallazgos: calcularHallazgos(videos, resumen, dias, hashtags),
    };
  }, [videos]);

  if (!calculos) {
    return <p className="panel py-6 text-center text-slate-400">No hay videos para analizar.</p>;
  }

  const { resumen, dias, hashtags, filas, creadores, hallazgos } = calculos;
  const opcion = OPCIONES_RANKING.find((o) => o.clave === metrica);
  const ranking = [...videos]
    .sort((a, b) => opcion.valor(b) - opcion.valor(a))
    .slice(0, TOP)
    .map((v) => ({
      id: v.id,
      etiqueta: etiquetaVideo(v),
      valor: opcion.valor(v),
      texto: opcion.formato(opcion.valor(v)),
      url: v.url,
    }));
  const archivo = nombreArchivo(nombre);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="etiqueta-hud">// métricas calculadas en el navegador</p>
          <h3 className="text-lg font-semibold text-white">Estadísticas</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => descargarCSV(filas, archivo)}
            className="boton-borde"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={() => descargarJSON(datosCompletos, archivo)}
            className="boton-borde"
          >
            Exportar JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Indicador etiqueta="Videos analizados" numero={resumen.cantidad} />
        <Indicador
          etiqueta="Tasa de interacción"
          numero={resumen.tasaInteraccion}
          formato={formatearPorcentaje}
          detalle="Interacciones / vistas"
          destacado
        />
        {METRICAS.map(({ clave, etiqueta }) => (
          <Indicador
            key={clave}
            etiqueta={`${etiqueta} totales`}
            numero={resumen.totales[clave]}
            formato={formatearNumero}
            detalle={`Promedio ${formatearNumero(resumen.promedios[clave])} · Mediana ${formatearNumero(
              resumen.medianas[clave],
            )}`}
          />
        ))}
      </div>

      {hallazgos.length > 0 && (
        <section className="panel esquinas border-cyan-400/20 bg-cyan-950/20 p-4">
          <p className="etiqueta-hud">// hallazgos automáticos</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-200">
            {hallazgos.map((h, i) => (
              // Cada hallazgo entra un poco después del anterior.
              <li key={h} style={{ animationDelay: `${i * 120}ms` }} className="flex gap-2 motion-safe:animate-aparecer">
                <span aria-hidden="true" className="font-mono text-cyan-300">&gt;</span>
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Gráficos dinámicos (recharts): evolución en el tiempo y relación vistas–interacción. */}
      {videos.length >= 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Suspense fallback={<PanelCargandoGrafico />}>
            <GraficoEvolucion videos={videos} />
          </Suspense>
          <Suspense fallback={<PanelCargandoGrafico />}>
            <GraficoDispersion videos={videos} />
          </Suspense>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <GraficoBarras
          titulo={`Top ${Math.min(TOP, videos.length)} videos`}
          descripcion={`Ordenados por ${opcion.etiqueta.toLowerCase()}.`}
          datos={ranking}
          acciones={
            <select
              value={metrica}
              onChange={(e) => setMetrica(e.target.value)}
              aria-label="Métrica del ranking"
              className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 font-mono text-xs text-slate-200"
            >
              {OPCIONES_RANKING.map(({ clave, etiqueta }) => (
                <option key={clave} value={clave}>
                  {etiqueta}
                </option>
              ))}
            </select>
          }
        />

        <GraficoBarras
          titulo="Vistas promedio por día de publicación"
          descripcion="Qué días funcionan mejor para publicar."
          datos={dias.map((d) => ({
            id: d.dia,
            etiqueta: d.dia,
            valor: d.vistasPromedio,
            texto: d.videos ? formatearNumero(d.vistasPromedio) : "—",
            detalle: `${d.videos} ${d.videos === 1 ? "video" : "videos"}`,
          }))}
        />

        <GraficoBarras
          titulo="Hashtags más usados"
          descripcion="Cuántos videos los usan y sus vistas promedio."
          datos={hashtags.map((h) => ({
            id: h.hashtag,
            etiqueta: `#${h.hashtag}`,
            valor: h.videos,
            texto: `${h.videos} ${h.videos === 1 ? "video" : "videos"}`,
            detalle: `${formatearNumero(h.vistasPromedio)} vistas promedio`,
          }))}
        />

        {creadores.length > 0 && (
          <GraficoBarras
            titulo="Creadores con más videos en el tema"
            descripcion="Quién domina esta búsqueda."
            datos={creadores.map((c) => ({
              id: c.usuario,
              etiqueta: `@${c.usuario}`,
              valor: c.videos,
              texto: `${c.videos} ${c.videos === 1 ? "video" : "videos"}`,
              detalle: `${formatearNumero(c.vistas)} vistas${
                c.seguidores != null ? ` · ${formatearNumero(c.seguidores)} seguidores` : ""
              }`,
            }))}
          />
        )}
      </div>

      <TablaVideos filas={filas} />
    </div>
  );
}
