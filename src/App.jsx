import { useState } from "react";
import { PaginaBusqueda, PaginaPerfil } from "./pages";

// Pestañas de navegación. No se usa router: la pestaña activa es solo un estado local.
const PESTANAS = [
  { id: "perfil", etiqueta: "Perfil" },
  { id: "busqueda", etiqueta: "Buscar por tema" },
];

/**
 * Componente raíz: cabecera con pestañas y las dos pantallas de la app.
 */
export default function App() {
  const [pestana, setPestana] = useState("perfil");

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="sticky top-0 z-10 bg-slate-900 text-white shadow">
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <h1 className="text-lg font-bold">View Scrapi</h1>
          <nav role="tablist" className="mt-3 flex">
            {PESTANAS.map(({ id, etiqueta }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pestana === id}
                onClick={() => setPestana(id)}
                className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition sm:flex-none sm:px-5 ${
                  pestana === id
                    ? "border-pink-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {etiqueta}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Ambas páginas quedan montadas para no perder resultados ni búsquedas en curso al cambiar de pestaña. */}
      <main className="mx-auto max-w-5xl px-4 py-5">
        <div hidden={pestana !== "perfil"}>
          <PaginaPerfil />
        </div>
        <div hidden={pestana !== "busqueda"}>
          <PaginaBusqueda />
        </div>
      </main>
    </div>
  );
}
