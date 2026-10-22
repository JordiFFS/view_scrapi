import { useState } from "react";
import { CampoNumero, limitar } from "./CampoNumero";
import { VistaPreviaPeticion } from "./VistaPreviaPeticion";

// Mismos límites que valida la API (app/validations/busqueda.py).
const MINIMO_CARACTERES = 2;
const RESULTADOS = { minimo: 1, maximo: 30, porDefecto: 10 };

/**
 * Formulario para buscar videos por tema.
 * Valida el largo mínimo en el navegador; el resto de validaciones las hace la API
 * y llegan como mensaje de error.
 *
 * @param {object} props
 * @param {(tema: string, opciones: { maxResultados: number, refrescar: boolean }) => void} props.onBuscar
 * @param {boolean} props.cargando Deshabilita el formulario mientras hay una búsqueda en curso.
 */
export function BuscadorTema({ onBuscar, cargando }) {
  const [tema, setTema] = useState("");
  // Se guarda como texto para que el campo se pueda borrar mientras se escribe.
  const [maxResultados, setMaxResultados] = useState(String(RESULTADOS.porDefecto));
  const [refrescar, setRefrescar] = useState(false);

  const corto = tema.trim().replace(/^#/, "").length < MINIMO_CARACTERES;

  function manejarEnvio(e) {
    e.preventDefault();
    if (corto || cargando) return;
    const cantidad = limitar(maxResultados, RESULTADOS);
    // Se muestra el valor corregido si estaba fuera de rango o vacío.
    setMaxResultados(String(cantidad));
    onBuscar(tema, { maxResultados: cantidad, refrescar });
  }

  // Lo mismo que enviará crearExtraccionBusqueda (api/tiktok.js), para la vista previa.
  const cuerpo = { tipo: "busqueda", q: tema.trim(), max_resultados: limitar(maxResultados, RESULTADOS), refrescar };

  return (
    <form onSubmit={manejarEnvio} className="space-y-3">
      <label htmlFor="tema" className="sr-only">
        Tema a buscar
      </label>
      <div className="flex gap-2">
        <input
          id="tema"
          type="search"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="ej. uñas acrílicas"
          maxLength={60}
          autoComplete="off"
          disabled={cargando}
          className="campo flex-1 font-mono"
        />
        <button
          type="submit"
          disabled={cargando || corto}
          className="boton-neon"
        >
          {cargando ? "Buscando…" : "Buscar"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CampoNumero
          id="max-resultados"
          etiqueta="Videos a mostrar"
          valor={maxResultados}
          onCambiar={setMaxResultados}
          limites={RESULTADOS}
          disabled={cargando}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={refrescar}
          onChange={(e) => setRefrescar(e.target.checked)}
          disabled={cargando}
          className="size-4 accent-pink-500"
        />
        Ignorar caché
      </label>

      <VistaPreviaPeticion metodo="POST" ruta="/api/extracciones" cuerpo={cuerpo} />
    </form>
  );
}
