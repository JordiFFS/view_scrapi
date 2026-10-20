// Punto de entrada: monta <App /> en el <div id="root"> de index.html.
// StrictMode ejecuta comprobaciones extra solo en desarrollo.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
