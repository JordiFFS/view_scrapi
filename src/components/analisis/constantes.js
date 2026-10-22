/**
 * Textos y colores compartidos por los componentes del análisis con IA.
 *
 * Las claves (`apertura`, `positivo`, `alegria`...) son las que devuelve la API;
 * aquí se les da el nombre en español que ve el usuario y el orden en que se muestran.
 */

import { TEMA } from "../graficos/tema";

// Colores en hexadecimal porque recharts dibuja en SVG y no entiende clases de Tailwind.
// La tinta, las guías y el rosado salen del tema común de los gráficos (graficos/tema.js).
export const COLORES = {
  principal: TEMA.principal,
  // En el fondo oscuro, la línea y los puntos del radar van en el rosado más claro.
  principalOscuro: TEMA.principalClaro,
  superficie: TEMA.superficie,
  texto: TEMA.texto,
  textoSuave: TEMA.textoSuave,
  cuadricula: TEMA.cuadricula,
  // Sentimiento: escala divergente (dos polos opuestos + gris en el medio). Azul y rojo se
  // distinguen también con daltonismo; el gris neutral no compite con ninguno de los dos.
  // Validado sobre el fondo oscuro con la skill dataviz (con etiquetas visibles en cada barra).
  positivo: "#3b82f6", // blue-500
  neutral: "#64748b", // slate-500
  negativo: "#f43f5e", // rose-500
  // "Otros" en gris: es un resto, no una emoción concreta, y no debe llamar la atención.
  resto: "#64748b",
};

/**
 * Los cinco rasgos del modelo Big Five (OCEAN), en el orden en que se dibujan en el radar.
 * `alto` y `bajo` explican qué suele significar un puntaje en cada extremo.
 */
export const RASGOS = [
  {
    clave: "apertura",
    nombre: "Apertura",
    descripcion: "Curiosidad, creatividad e interés por ideas y experiencias nuevas.",
    alto: "Contenido variado, original o experimental.",
    bajo: "Contenido más convencional y predecible.",
  },
  {
    clave: "responsabilidad",
    nombre: "Responsabilidad",
    descripcion: "Organización, constancia y orientación a metas.",
    alto: "Mensajes ordenados, planificados y consistentes.",
    bajo: "Estilo más espontáneo e improvisado.",
  },
  {
    clave: "extraversion",
    nombre: "Extraversión",
    descripcion: "Energía social, entusiasmo y gusto por interactuar.",
    alto: "Tono expresivo, cercano y que busca interacción.",
    bajo: "Tono más reservado y tranquilo.",
  },
  {
    clave: "amabilidad",
    nombre: "Amabilidad",
    descripcion: "Empatía, cordialidad y disposición a cooperar.",
    alto: "Lenguaje cálido, positivo y de apoyo.",
    bajo: "Lenguaje más directo, crítico o competitivo.",
  },
  {
    clave: "neuroticismo",
    nombre: "Neuroticismo",
    descripcion: "Tendencia a expresar emociones negativas como ansiedad o enojo.",
    alto: "Más textos con preocupación, queja o tensión.",
    bajo: "Tono emocionalmente estable y sereno.",
  },
];

// Sentimiento de los comentarios, de positivo a negativo (el neutral queda en el medio).
export const SENTIMIENTOS = [
  { clave: "positivo", nombre: "Positivo", color: COLORES.positivo },
  { clave: "neutral", nombre: "Neutral", color: COLORES.neutral },
  { clave: "negativo", nombre: "Negativo", color: COLORES.negativo },
];

// Nombres de las emociones. Si la API devuelve una que no está aquí, se muestra su clave.
export const EMOCIONES = {
  alegria: "Alegría",
  tristeza: "Tristeza",
  enojo: "Enojo",
  miedo: "Miedo",
  sorpresa: "Sorpresa",
  asco: "Asco",
  otros: "Otros",
};
