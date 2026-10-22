import { useEffect, useState } from "react";

/**
 * Muestra las frases de `frases` una tras otra, cada `cadaMs` milisegundos, con una entrada suave.
 * Es decorativo: cuenta qué tipo de trabajo se está haciendo mientras se espera la respuesta,
 * no el paso exacto en el que va el servidor (la API no lo informa).
 *
 * @param {object} props
 * @param {string[]} props.frases
 * @param {number} [props.cadaMs]
 * @param {string} [props.className]
 */
export function TextoRotativo({ frases, cadaMs = 3500, className = "" }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => setIndice((i) => (i + 1) % frases.length), cadaMs);
    return () => clearInterval(intervalo);
  }, [frases.length, cadaMs]);

  // La `key` cambia con cada frase: React crea un elemento nuevo y la animación se repite.
  return (
    <p key={indice} className={`motion-safe:animate-aparecer ${className}`}>
      {frases[indice % frases.length]}
    </p>
  );
}
