import { useState } from "react";
import { CampoNumero, limitar } from "./CampoNumero";

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
          className="w-full flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={cargando || corto}
          className="rounded-xl bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={refrescar}
          onChange={(e) => setRefrescar(e.target.checked)}
          disabled={cargando}
          className="size-4 accent-pink-600"
        />
        Ignorar caché
      </label>
    </form>
  );
}
