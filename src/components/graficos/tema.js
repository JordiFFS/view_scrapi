/**
 * Colores de los gráficos de recharts para el tema oscuro.
 * Van en hexadecimal porque recharts dibuja en SVG y no entiende clases de Tailwind.
 *
 * La serie principal (rosado) y las secundarias (cian, violeta) se validaron con el script de
 * la skill dataviz sobre la superficie #0b1222: se distinguen con daltonismo y tienen contraste >= 3:1.
 */
export const TEMA = {
  superficie: "#0b1222",
  // Series de datos
  principal: "#ec4899", // pink-500
  principalClaro: "#f472b6", // pink-400, para líneas y puntos sobre el fondo oscuro
  secundario: "#0891b2", // cyan-600
  terciario: "#8b5cf6", // violet-500
  // Tinta y guías
  texto: "#e2e8f0", // slate-200
  textoSuave: "#94a3b8", // slate-400
  cuadricula: "#1e293b", // slate-800: una línea fina que casi no se ve
  eje: "#334155", // slate-700
  cursor: "#22d3ee", // cyan-400: la línea que sigue al puntero
};

/**
 * Texto de un eje sin cortes de línea: recharts parte las etiquetas en los espacios cuando
 * no caben ("600" arriba y "mil" abajo). El espacio de no separación (\u00a0) lo evita.
 * @param {string} texto
 */
export const sinCortes = (texto) => String(texto).replaceAll(" ", "\u00a0");

// Duración de las animaciones de entrada de recharts (ms).
export const ANIMACION_MS = 900;
