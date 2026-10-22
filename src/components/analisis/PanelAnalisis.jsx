import { useState } from "react";
import { formatearFecha } from "../../utils";
import { MensajeError } from "../MensajeError";
import { CargandoIA } from "./CargandoIA";
import { DescripcionRasgos } from "./DescripcionRasgos";
import { GraficoBig5 } from "./GraficoBig5";
import { GraficoEmociones } from "./GraficoEmociones";
import { GraficoSentimiento } from "./GraficoSentimiento";
import { NotaMetodologica } from "./NotaMetodologica";

// Un dato corto del resumen (textos analizados, comentarios, etc.).
function Dato({ etiqueta, valor }) {
  return (
    <div className="panel p-3">
      <p className="etiqueta-hud !text-[9px]">{etiqueta}</p>
      <p className="mt-1 font-mono text-lg font-bold text-white">{valor}</p>
    </div>
  );
}

/**
 * Contenedor del análisis con IA de un perfil: botón para pedirlo, estados de carga y error,
 * y los gráficos cuando llega el resultado.
 *
 * No hace la petición: recibe el estado de useAnalisis (desde PaginaPerfil) y avisa con
 * `onAnalizar` cuando el usuario toca el botón. Así se cumple la regla de que los componentes
 * no usan axios ni la capa api.
 *
 * @param {object} props
 * @param {string} props.usuario Usuario del perfil cargado (para los textos).
 * @param {object | null} props.analisis Respuesta de GET /api/analisis/{usuario}.
 * @param {boolean} props.cargando
 * @param {string | null} props.error
 * @param {number | null} props.inicio Hora en que empezó el análisis (para el contador).
 * @param {(opciones: { refrescar: boolean }) => void} props.onAnalizar
 */
export function PanelAnalisis({ usuario, analisis, cargando, error, inicio, onAnalizar }) {
  // Estado propio del formulario (como en BuscadorPerfil): solo la casilla de caché.
  const [refrescar, setRefrescar] = useState(false);

  const comentarios = analisis?.comentarios;
  const hayComentarios = comentarios?.total_analizados > 0;

  return (
    <div className="space-y-4">
      {/* 1. Presentación y botón: el análisis se pide a mano, no al cargar el perfil. */}
      <section className="panel esquinas relative overflow-hidden border-violet-500/30 p-4">
        {/* Halo violeta de fondo: identifica la sección de IA. */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-violet-600/25 blur-3xl" />
        <p className="etiqueta-hud relative !text-violet-300">// modelos de hugging face</p>
        <h3 className="relative mt-1 text-lg font-semibold text-white">Análisis con IA</h3>
        <p className="relative mt-1 text-sm text-slate-300">
          Modelos de Hugging Face estiman la personalidad de @{usuario} a partir de sus descripciones
          y analizan el sentimiento y las emociones de los comentarios que recibe.
        </p>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
          <button
            type="button"
            onClick={() => onAnalizar({ refrescar })}
            disabled={cargando}
            className="boton-neon w-full sm:w-auto"
          >
            {cargando ? "Analizando…" : analisis ? "Volver a analizar" : "Analizar con IA"}
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={refrescar}
              onChange={(e) => setRefrescar(e.target.checked)}
              disabled={cargando}
              className="size-4 accent-pink-500"
            />
            Ignorar caché
          </label>
        </div>
      </section>

      {/* 2. Estados: carga, error o resultado (uno a la vez, como en las páginas). */}
      {cargando && <CargandoIA inicio={inicio} />}
      {!cargando && error && <MensajeError mensaje={error} />}

      {!cargando && analisis && (
        <>
          {/* 3. Resumen: cuánto se analizó y de dónde salió el resultado. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Dato etiqueta="Textos del creador" valor={analisis.textos_analizados ?? "—"} />
            <Dato etiqueta="Comentarios" valor={comentarios?.total_analizados ?? 0} />
            <Dato etiqueta="Fecha del análisis" valor={formatearFecha(analisis.fecha_analisis)} />
            <Dato etiqueta="Origen" valor={analisis.desde_cache ? "Caché" : "Recién calculado"} />
          </div>

          {/* 4. Personalidad del creador: radar + explicación en texto. */}
          <div className="grid gap-4 lg:grid-cols-2">
            <GraficoBig5 big5={analisis.big5_creador} />
            <DescripcionRasgos big5={analisis.big5_creador} />
          </div>

          {/* 5. Audiencia: solo si hubo comentarios para analizar. */}
          {hayComentarios ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <GraficoSentimiento sentimiento={comentarios.sentimiento} total={comentarios.total_analizados} />
              <GraficoEmociones emociones={comentarios.emociones} />
            </div>
          ) : (
            <p className="panel p-4 text-center text-sm text-slate-400">
              No hubo comentarios para analizar. Busca el perfil con "Incluir comentarios" activado.
            </p>
          )}

          {/* 6. Cómo leer los resultados. */}
          <NotaMetodologica nota={analisis.nota} advertencia={analisis.advertencia} modelos={analisis.modelos} />
        </>
      )}
    </div>
  );
}
