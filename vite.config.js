import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Configuración de Vite: React (JSX y recarga en caliente) + Tailwind CSS v4.
// Tailwind se integra como plugin de Vite; no necesita postcss.config.js ni tailwind.config.js.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
