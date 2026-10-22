import { useState } from "react";
import { IndicadorAPI } from "./components";
import { useSalud } from "./hooks";
import { PaginaBusqueda, PaginaPerfil } from "./pages";

// Pestañas de navegación. No se usa router: la pestaña activa es solo un estado local.
const PESTANAS = [
  { id: "perfil", numero: "01", etiqueta: "Perfil" },
  { id: "busqueda", numero: "02", etiqueta: "Buscar por tema" },
];

// Logo: unos corchetes de visor con una línea de escaneo en el medio.
function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0">
      <defs>
        <linearGradient id="logo-degradado" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M3 10V5a2 2 0 0 1 2-2h5M22 3h5a2 2 0 0 1 2 2v5M29 22v5a2 2 0 0 1-2 2h-5M10 29H5a2 2 0 0 1-2-2v-5"
        fill="none"
        stroke="url(#logo-degradado)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="8" y="15" width="16" height="2" rx="1" fill="#22d3ee" className="motion-safe:animate-pulse" />
      <circle cx="16" cy="16" r="4" fill="none" stroke="#ec4899" strokeWidth="2" />
    </svg>
  );
}

/**
 * Componente raíz: cabecera (logo, estado de la API y pestañas) y las dos páginas.
 */
export default function App() {
  const [pestana, setPestana] = useState("perfil");
  const salud = useSalud();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-fondo/80 backdrop-blur-lg">
        <div className="mx-auto max-w-6xl px-4 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Logo />
              <div className="min-w-0">
                <h1 className="truncate font-mono text-base font-bold tracking-tight text-white">
                  VIEW<span className="text-pink-500">//</span>SCRAPI
                </h1>
                <p className="etiqueta-hud truncate !text-[9px] !text-slate-500">consola · tiktok</p>
              </div>
            </div>
            <IndicadorAPI
              estado={salud.estado}
              latenciaMs={salud.latenciaMs}
              url={import.meta.env.VITE_API_URL}
              onComprobar={salud.comprobar}
            />
          </div>

          <nav role="tablist" aria-label="Secciones" className="mt-3 flex gap-1">
            {PESTANAS.map(({ id, numero, etiqueta }) => (
              <button
                key={id}
                id={`pestana-${id}`}
                type="button"
                role="tab"
                aria-selected={pestana === id}
                // Enlaza la pestaña con su panel para los lectores de pantalla.
                aria-controls={`panel-${id}`}
                onClick={() => setPestana(id)}
                className={`relative flex-1 py-2.5 text-sm font-medium transition sm:flex-none sm:px-5 ${
                  pestana === id ? "text-white" : "text-slate-500 hover:text-slate-200"
                }`}
              >
                <span className="mr-1.5 font-mono text-[10px] text-cyan-400/70">{numero}</span>
                {etiqueta}
                {/* Línea de neón bajo la pestaña activa. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 shadow-[0_0_10px_rgb(236_72_153/0.8)] transition-opacity ${
                    pestana === id ? "opacity-100" : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Ambas páginas quedan montadas para no perder resultados ni búsquedas en curso al cambiar de pestaña. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
        <div id="panel-perfil" role="tabpanel" aria-labelledby="pestana-perfil" hidden={pestana !== "perfil"}>
          <PaginaPerfil />
        </div>
        <div id="panel-busqueda" role="tabpanel" aria-labelledby="pestana-busqueda" hidden={pestana !== "busqueda"}>
          <PaginaBusqueda />
        </div>
      </main>

      <footer className="border-t border-white/5 py-4 text-center font-mono text-[10px] tracking-widest text-slate-600 uppercase">
        TikTok → Playwright → FastAPI → JSON → React → Gráficos
      </footer>
    </div>
  );
}
