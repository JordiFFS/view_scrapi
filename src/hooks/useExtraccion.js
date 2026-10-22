/**
 * Hook genérico para el flujo de extracciones asíncronas de la API.
 *
 *   1. `crear()` hace el POST a /api/extracciones y la API responde al instante con un id.
 *   2. Se consulta GET /api/extracciones/{id} cada `consultar_de_nuevo_en_seg` segundos.
 *   3. Al llegar a "completada" se guarda `resultado`; si llega "error", se muestra el detalle.
 *
 * Además lleva un `registro` (bitácora) de cada paso y unas `metricas` (tiempo, consultas,
 * tamaño). La interfaz los muestra en la consola y en el inspector de datos, para ver
 * qué pasó realmente entre el navegador y la API.
 *
 * Lo usan usePerfil y useBusqueda, que solo cambian la función que crea la extracción.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { consultarExtraccion } from "../api";
import { formatearBytes, tamanoJSON } from "../utils";

// Se usa si la API no indica cada cuánto volver a consultar.
const ESPERA_POR_DEFECTO_SEG = 3;
// Margen por encima de los 3 min que puede tardar la API, contando la espera en cola.
const ESPERA_MAXIMA_MS = 10 * 60 * 1000;

const pausa = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// "3fa85f64-5717-..." -> "3fa85f64": el id completo no aporta nada en la consola.
const idCorto = (id) => String(id ?? "").slice(0, 8);

/**
 * @typedef {{ ms: number, nivel: "envio" | "respuesta" | "espera" | "ok" | "error", texto: string }} LineaRegistro
 *   ms: milisegundos desde que empezó la extracción.
 * @typedef {{ duracionMs: number | null, consultas: number, bytes: number | null, idExtraccion: string | null }} Metricas
 */

/**
 * @returns {{
 *   datos: object | null,        resultado de la extracción completada
 *   cargando: boolean,
 *   error: string | null,        mensaje listo para mostrar
 *   progreso: { estado: string, posicionEnCola: number | null } | null,
 *   registro: LineaRegistro[],   bitácora de la última extracción
 *   metricas: Metricas | null,
 *   ejecutar: (crear: () => Promise<object>, descripcion?: string) => Promise<void>,
 * }}
 */
export function useExtraccion() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  // Estado de la extracción en curso: { estado, posicionEnCola }
  const [progreso, setProgreso] = useState(null);
  const [registro, setRegistro] = useState([]);
  const [metricas, setMetricas] = useState(null);

  // Cada ejecución recibe un número; si empieza otra (o se desmonta el componente),
  // la anterior deja de consultar y no pisa el estado.
  const ejecucionActual = useRef(0);
  useEffect(() => () => void ejecucionActual.current++, []);

  /**
   * @param {() => Promise<object>} crear Hace el POST y devuelve la extracción inicial.
   * @param {string} [descripcion] Qué se envía, para la primera línea del registro.
   */
  const ejecutar = useCallback(async (crear, descripcion = "POST /api/extracciones") => {
    const id = ++ejecucionActual.current;
    const vigente = () => id === ejecucionActual.current;
    const inicio = performance.now();

    // Agrega una línea a la bitácora con el tiempo transcurrido.
    const anotar = (nivel, texto) => {
      if (!vigente()) return;
      const ms = performance.now() - inicio;
      setRegistro((lineas) => [...lineas, { ms, nivel, texto }]);
    };

    setCargando(true);
    setError(null);
    setDatos(null);
    setRegistro([]);
    setMetricas({ duracionMs: null, consultas: 0, bytes: null, idExtraccion: null });
    let consultas = 0;

    try {
      anotar("envio", descripcion);
      let extraccion = await crear();
      anotar(
        "respuesta",
        `202 · id ${idCorto(extraccion.id)} · ${extraccion.estado}${
          extraccion.posicion_en_cola ? ` (posición ${extraccion.posicion_en_cola} en cola)` : ""
        }`,
      );
      setMetricas((m) => ({ ...m, idExtraccion: extraccion.id ?? null }));
      const limite = Date.now() + ESPERA_MAXIMA_MS;
      // Para anotar solo cuando cambia algo, no en cada consulta repetida.
      let ultimoEstado = `${extraccion.estado}-${extraccion.posicion_en_cola}`;

      // Si el resultado ya estaba en caché, la extracción llega "completada" y no se entra al bucle.
      while (vigente() && (extraccion.estado === "pendiente" || extraccion.estado === "en_proceso")) {
        setProgreso({ estado: extraccion.estado, posicionEnCola: extraccion.posicion_en_cola });
        if (Date.now() > limite) {
          throw new Error("La extracción está tardando demasiado. Intenta de nuevo más tarde.");
        }
        const espera = extraccion.consultar_de_nuevo_en_seg ?? ESPERA_POR_DEFECTO_SEG;
        await pausa(espera * 1000);
        if (!vigente()) return;
        extraccion = await consultarExtraccion(extraccion.id);
        consultas += 1;
        setMetricas((m) => ({ ...m, consultas }));

        const estadoActual = `${extraccion.estado}-${extraccion.posicion_en_cola}`;
        if (estadoActual !== ultimoEstado) {
          ultimoEstado = estadoActual;
          anotar(
            extraccion.estado === "en_proceso" ? "espera" : "respuesta",
            `GET /extracciones/${idCorto(extraccion.id)} → ${extraccion.estado}${
              extraccion.posicion_en_cola ? ` (posición ${extraccion.posicion_en_cola})` : ""
            } · consulta #${consultas}`,
          );
        }
      }

      if (!vigente()) return;
      if (extraccion.estado === "error") {
        throw new Error(extraccion.error?.detalle || "La extracción falló.");
      }

      // Se mide el resultado antes de guardarlo: es lo que se va a graficar.
      const bytes = tamanoJSON(extraccion.resultado);
      anotar("ok", `completada · ${formatearBytes(bytes)} de JSON recibidos en ${consultas} consultas`);
      setMetricas((m) => ({ ...m, consultas, bytes, duracionMs: performance.now() - inicio }));
      setDatos(extraccion.resultado);
    } catch (err) {
      // Los errores HTTP ya vienen con mensaje legible desde el interceptor de client.js.
      anotar("error", err.message);
      if (vigente()) {
        setError(err.message);
        setMetricas((m) => ({ ...m, consultas, duracionMs: performance.now() - inicio }));
      }
    } finally {
      if (vigente()) {
        setCargando(false);
        setProgreso(null);
      }
    }
  }, []);

  return { datos, cargando, error, progreso, registro, metricas, ejecutar };
}
