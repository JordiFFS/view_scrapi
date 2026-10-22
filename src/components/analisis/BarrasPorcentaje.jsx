import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatearPorcentaje } from "../../utils";
import { COLORES } from "./constantes";
import { TooltipPorcentaje } from "./TooltipPorcentaje";

// Alto de cada fila y espacio extra para el eje de abajo, en píxeles.
const ALTO_FILA = 36;
const ALTO_EJE = 28;

const porcentaje = (valor) => formatearPorcentaje(valor, { decimales: 0, separado: true });

/**
 * Barras horizontales de proporciones (0–1) hechas con recharts.
 * La base común de GraficoSentimiento y GraficoEmociones: solo cambian los datos y los colores.
 *
 * Decisiones de diseño:
 *   - El eje va siempre de 0 % a 100 %, no hasta el valor más alto, para que el largo de
 *     cada barra sea la proporción real y se pueda comparar entre gráficos.
 *   - Barras delgadas (18 px) con la punta redondeada y la base recta.
 *   - El porcentaje se escribe al final de cada barra, así se lee sin pasar el mouse
 *     (importante en el celular); el tooltip repite el dato al tocar la barra.
 *
 * @param {object} props
 * @param {{ clave: string, nombre: string, valor: number, color: string }[]} props.datos
 * @param {string} props.etiquetaAccesible Describe el gráfico para lectores de pantalla.
 */
export function BarrasPorcentaje({ datos, etiquetaAccesible }) {
  return (
    // role="img" + aria-label: el lector de pantalla anuncia la descripción en vez del SVG.
    // Los valores siguen visibles como texto al final de cada barra.
    <div role="img" aria-label={etiquetaAccesible}>
      {/* ResponsiveContainer toma el ancho del contenedor: se adapta del celular al escritorio. */}
      <ResponsiveContainer width="100%" height={datos.length * ALTO_FILA + ALTO_EJE}>
        {/* layout="vertical" en recharts significa barras horizontales (las categorías van en Y). */}
        <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }}>
          {/* Solo líneas verticales, finas y claras: guían la lectura sin competir con las barras. */}
          <CartesianGrid horizontal={false} stroke={COLORES.cuadricula} />
          <XAxis
            type="number"
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={porcentaje}
            tick={{ fontSize: 11, fill: COLORES.textoSuave }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            width={76}
            tick={{ fontSize: 12, fill: COLORES.texto }}
            axisLine={{ stroke: COLORES.cuadricula }}
            tickLine={false}
          />
          <Tooltip content={<TooltipPorcentaje />} cursor={{ fill: "rgb(255 255 255 / 0.04)" }} />
          {/* radius [arriba-izq, arriba-der, abajo-der, abajo-izq]: solo se redondea la punta. */}
          {/* Las barras crecen desde el eje al aparecer (animación de recharts). */}
          <Bar dataKey="valor" barSize={18} radius={[0, 4, 4, 0]} animationDuration={900}>
            {/* Cell permite dar un color distinto a cada barra. */}
            {datos.map((d) => (
              <Cell key={d.clave} fill={d.color} />
            ))}
            {/* El texto va en gris claro, nunca del color de la barra, para que siempre se lea. */}
            <LabelList
              dataKey="valor"
              position="right"
              formatter={porcentaje}
              style={{ fontSize: 12, fontWeight: 600, fill: COLORES.texto }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
