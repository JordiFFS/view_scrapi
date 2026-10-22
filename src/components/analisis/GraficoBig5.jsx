import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatearPorcentaje } from "../../utils";
import { COLORES, RASGOS } from "./constantes";
import { TooltipPorcentaje } from "./TooltipPorcentaje";

const porcentaje = (valor) => formatearPorcentaje(valor, { decimales: 0, separado: true });

/**
 * Etiqueta de cada eje del radar: nombre del rasgo y su porcentaje en dos líneas.
 *
 * Recharts coloca el texto pegado al borde y lo alinea hacia afuera, lo que en un celular hace
 * que "Responsabilidad" se salga por la derecha. Aquí se centra el texto sobre el punto y se
 * apila hacia arriba (rasgos de la mitad superior) o hacia abajo (mitad inferior), así nunca
 * tapa el gráfico ni se corta.
 */
function EtiquetaRasgo({ x, y, payload, datos }) {
  // payload.value es el nombre del rasgo; payload.coordinate es el ángulo en grados.
  const dato = datos.find((d) => d.nombre === payload.value);
  const arriba = Math.sin((payload.coordinate * Math.PI) / 180) > 0.1;
  // Desplazamiento vertical de las dos líneas (nombre y valor) según el lado.
  const [dyNombre, dyValor] = arriba ? [-16, 0] : [8, 22];

  return (
    <text x={x} y={y} textAnchor="middle" fontSize={11}>
      <tspan x={x} dy={dyNombre} fill={COLORES.textoSuave}>
        {payload.value}
      </tspan>
      <tspan x={x} y={y} dy={dyValor} fill={COLORES.texto} fontWeight={600} fontSize={12}>
        {porcentaje(dato?.valor)}
      </tspan>
    </text>
  );
}

/**
 * Gráfico de radar con los cinco rasgos Big Five del creador (valores 0–1).
 *
 * Un radar sirve aquí porque los cinco rasgos se miden en la misma escala y lo que interesa
 * es la "forma" del perfil (qué rasgos sobresalen). Los números exactos y su explicación
 * están en DescripcionRasgos, que funciona como la versión en texto de este gráfico.
 *
 * @param {object} props
 * @param {Record<string, number>} props.big5 Objeto `big5_creador` de la API.
 */
export function GraficoBig5({ big5 }) {
  // 1. Se convierte el objeto { apertura: 0.7, ... } en una lista en el orden de RASGOS,
  //    que es el formato que necesita recharts (una fila por eje).
  const datos = RASGOS.map(({ clave, nombre }) => ({
    clave,
    nombre,
    valor: Number(big5?.[clave]) || 0,
  }));

  const descripcion = datos.map((d) => `${d.nombre} ${porcentaje(d.valor)}`).join(", ");

  // min-w-0: dentro de un grid, evita que el contenido (el SVG de recharts) ensanche la tarjeta en el celular.
  return (
    <section className="panel min-w-0 p-4">
      <h4 className="font-semibold text-white">Personalidad del creador (Big Five)</h4>
      <p className="text-xs text-slate-400">
        Estimada a partir de las descripciones de sus videos. Cada eje va de 0 % (centro) a 100 % (borde).
      </p>

      {/* El selector de Tailwind aplica un brillo de neón solo al polígono del radar. */}
      <div
        role="img"
        aria-label={`Radar de personalidad: ${descripcion}.`}
        className="mt-2 [&_.recharts-radar-polygon]:drop-shadow-[0_0_10px_rgb(236_72_153/0.6)]"
      >
        <ResponsiveContainer width="100%" height={320}>
          {/* outerRadius en % deja espacio alrededor para las etiquetas de cada rasgo. */}
          <RadarChart data={datos} outerRadius="68%" margin={{ top: 24, right: 8, bottom: 16, left: 8 }}>
            {/* 2. La telaraña de fondo: polígonos concéntricos y radios finos y claros. */}
            <PolarGrid stroke={COLORES.cuadricula} />
            {/* 3. Un eje por rasgo, con la etiqueta personalizada (nombre + porcentaje). */}
            <PolarAngleAxis dataKey="nombre" tick={<EtiquetaRasgo datos={datos} />} />
            {/* 4. Escala fija de 0 a 1: así un 40 % siempre se ve como 40 %, sin importar el resto.
                   Se oculta porque las etiquetas ya muestran el valor de cada rasgo. */}
            <PolarRadiusAxis domain={[0, 1]} tickCount={5} tick={false} axisLine={false} />
            <Tooltip content={<TooltipPorcentaje />} />
            {/* 5. El perfil: línea de 2 px, relleno muy suave y un punto en cada vértice. */}
            <Radar
              dataKey="valor"
              stroke={COLORES.principalOscuro}
              strokeWidth={2}
              fill={COLORES.principal}
              fillOpacity={0.15}
              dot={{ r: 4, fill: COLORES.principalOscuro, stroke: COLORES.superficie, strokeWidth: 2 }}
              // El polígono crece desde el centro al aparecer.
              animationDuration={1000}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
