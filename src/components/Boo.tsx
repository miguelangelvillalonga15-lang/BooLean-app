import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import type { BooAnimo } from '@/types/content';
import { colores, espacio, radio } from '@/theme';

import { Texto } from './ui/Texto';

// Boo está dibujada en SVG a partir de la gata real: pelo largo blanco y negro,
// "capucha" negra con una mancha alrededor del ojo izquierdo, ojos verdes y nariz rosa.

const c = {
  negro: '#1C1C22',
  blanco: '#F6F3EE',
  ojo: '#B7C454',
  ojoBorde: '#2B2B2B',
  nariz: '#F0A6B1',
  boca: '#5A4A4E',
  bocaAdentro: '#7A3D4A',
  bigote: '#CFCBD6',
  orejaAdentro: '#4A3A44',
  rubor: '#F49AAE',
  lagrima: '#7CC8FF',
};

type Ojo = { x: number; y: number; sobreNegro: boolean };
const OJOS: Ojo[] = [
  { x: 72, y: 112, sobreNegro: true },
  { x: 128, y: 112, sobreNegro: false },
];

function OjoAbierto({ x, y, mirar = [0, 0], pupila = [3.5, 8] }: Ojo & { mirar?: number[]; pupila?: number[] }) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={14} ry={11} fill={c.ojo} stroke={c.ojoBorde} strokeWidth={2.5} />
      <Ellipse cx={x + mirar[0]} cy={y + mirar[1]} rx={pupila[0]} ry={pupila[1]} fill={c.negro} />
      <Circle cx={x + 4 + mirar[0]} cy={y - 4 + mirar[1]} r={3} fill={c.blanco} />
    </G>
  );
}

/** Párpado que tapa la parte de arriba del ojo; `caida` inclina el borde (tristeza). */
function Parpado({ x, y, sobreNegro, alto, caida = 0 }: Ojo & { alto: number; caida?: number }) {
  const lado = x < 100 ? -1 : 1; // la caída va hacia afuera de la cara
  const yIn = y - 13 + alto - caida * 0.5;
  const yOut = y - 13 + alto + caida;
  const xIn = x - 17 * lado;
  const xOut = x + 17 * lado;
  const relleno = sobreNegro ? c.negro : c.blanco;
  const linea = sobreNegro ? c.blanco : c.ojoBorde;
  return (
    <G>
      <Path d={`M${xIn},${y - 14} L${xOut},${y - 14} L${xOut},${yOut} L${xIn},${yIn} Z`} fill={relleno} />
      <Path d={`M${xIn + 2 * lado},${yIn} L${xOut - 2 * lado},${yOut}`} stroke={linea} strokeWidth={2.5} strokeLinecap="round" />
    </G>
  );
}

function Ojos({ animo }: { animo: BooAnimo }) {
  return (
    <G>
      {OJOS.map((o) => {
        switch (animo) {
          case 'contenta':
            return (
              <Path
                key={o.x}
                d={`M${o.x - 12},${o.y + 3} Q${o.x},${o.y - 10} ${o.x + 12},${o.y + 3}`}
                stroke={o.sobreNegro ? c.blanco : c.ojoBorde}
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
              />
            );
          case 'pensando':
            return <OjoAbierto key={o.x} {...o} mirar={[5, -3]} />;
          case 'sorprendida':
            return (
              <G key={o.x}>
                <Circle cx={o.x} cy={o.y} r={13} fill={c.ojo} stroke={c.ojoBorde} strokeWidth={2.5} />
                <Circle cx={o.x} cy={o.y} r={4.5} fill={c.negro} />
                <Circle cx={o.x + 4} cy={o.y - 5} r={2.5} fill={c.blanco} />
              </G>
            );
          case 'triste':
            return (
              <G key={o.x}>
                <OjoAbierto {...o} pupila={[6, 8]} />
                <Parpado {...o} alto={4} caida={6} />
              </G>
            );
          case 'decepcionada':
            return (
              <G key={o.x}>
                <OjoAbierto {...o} />
                <Parpado {...o} alto={11} />
              </G>
            );
          default:
            return <OjoAbierto key={o.x} {...o} />;
        }
      })}
    </G>
  );
}

function Boca({ animo }: { animo: BooAnimo }) {
  const trazo = { stroke: c.boca, strokeWidth: 2.5, strokeLinecap: 'round' as const, fill: 'none' };
  const centro = <Path d="M100,141 L100,146" {...trazo} />;
  switch (animo) {
    case 'presentandose':
    case 'contenta':
      return (
        <G>
          {centro}
          <Path d="M89,146 Q100,163 111,146 Z" fill={c.bocaAdentro} stroke={c.boca} strokeWidth={2} strokeLinejoin="round" />
        </G>
      );
    case 'pensando':
      return (
        <G>
          {centro}
          <Path d="M94,150 L107,148" {...trazo} />
        </G>
      );
    case 'triste':
    case 'decepcionada':
      return (
        <G>
          {centro}
          <Path d="M90,154 Q100,145 110,154" {...trazo} />
        </G>
      );
    case 'sorprendida':
      return <Ellipse cx={100} cy={153} rx={5} ry={6.5} fill={c.bocaAdentro} />;
    default:
      return (
        <G>
          {centro}
          <Path d="M88,146 Q94,153 100,146 Q106,153 112,146" {...trazo} />
        </G>
      );
  }
}

/** Dibujo de Boo. `tamano` es el ancho en puntos. */
export function BooDibujo({ animo = 'feliz', tamano = 96 }: { animo?: BooAnimo; tamano?: number }) {
  const rubor = animo === 'presentandose' || animo === 'contenta';
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 200 200">
      {/* Pechera peluda */}
      <Path d="M48,160 L40,200 L160,200 L152,160 Z" fill={c.blanco} />
      <Path d="M58,168 L66,186 L74,170 L84,190 L92,172 L100,192 L108,172 L116,190 L126,170 L134,186 L142,168" stroke="#DCD7CF" strokeWidth={2} fill="none" strokeLinejoin="round" />

      {/* Orejas */}
      <Path d="M36,104 L44,22 Q46,15 53,20 L102,62 Z" fill={c.negro} />
      <Path d="M164,104 L156,22 Q154,15 147,20 L98,62 Z" fill={c.negro} />
      <Path d="M52,88 L55,38 L86,66 Z" fill={c.orejaAdentro} />
      <Path d="M148,88 L145,38 L114,66 Z" fill={c.orejaAdentro} />
      <G stroke={c.blanco} strokeWidth={2.5} strokeLinecap="round" opacity={0.85}>
        <Path d="M56,82 L62,56" />
        <Path d="M63,84 L72,62" />
        <Path d="M144,82 L138,56" />
        <Path d="M137,84 L128,62" />
      </G>

      {/* Cara con mejillas peludas */}
      <Path
        d="M32,112 C32,76 62,52 100,52 C138,52 168,76 168,112 L180,121 L168,127 L178,139 L164,144 L170,157 L150,158 C138,170 120,177 100,177 C80,177 62,170 50,158 L30,157 L36,144 L22,139 L32,127 L20,121 Z"
        fill={c.blanco}
      />

      {/* Capucha negra con la franja blanca en la frente, y la mancha del ojo izquierdo */}
      <Path
        d="M31,115 C29,76 60,51 100,51 C140,51 171,76 169,115 C161,100 150,92 137,90 L105,74 Q100,70 95,74 L63,90 C50,92 39,100 31,115 Z"
        fill={c.negro}
      />
      <Ellipse cx={69} cy={109} rx={25} ry={19} fill={c.negro} transform="rotate(-12 69 109)" />

      <Ojos animo={animo} />

      {rubor ? (
        <G opacity={0.55}>
          <Ellipse cx={58} cy={140} rx={9} ry={5} fill={c.rubor} />
          <Ellipse cx={142} cy={140} rx={9} ry={5} fill={c.rubor} />
        </G>
      ) : null}
      {animo === 'triste' ? <Path d="M137,125 Q131,134 137,139 Q143,134 137,125 Z" fill={c.lagrima} /> : null}

      {/* Bigotes */}
      <G stroke={c.bigote} strokeWidth={1.8} strokeLinecap="round">
        <Path d="M84,143 L38,135" />
        <Path d="M84,148 L40,152" />
        <Path d="M116,143 L162,135" />
        <Path d="M116,148 L160,152" />
      </G>

      {/* Nariz y boca */}
      <Path d="M92,131 Q100,127 108,131 Q104,139 100,141 Q96,139 92,131 Z" fill={c.nariz} />
      <Boca animo={animo} />
    </Svg>
  );
}

type Props = {
  animo?: BooAnimo;
  /** Si está, Boo lo dice en un globito al costado. */
  mensaje?: string;
  tamano?: number;
};

export function Boo({ animo = 'feliz', mensaje, tamano = 64 }: Props) {
  const cara = (
    <View
      accessible
      accessibilityLabel={`Boo, ${animo}`}
      style={[estilos.cara, { width: tamano * 1.2, height: tamano * 1.2 }]}>
      <BooDibujo animo={animo} tamano={tamano} />
    </View>
  );

  if (!mensaje) return cara;

  return (
    <View style={estilos.fila}>
      {cara}
      <View style={estilos.globo}>
        <Texto variante="chico">{mensaje}</Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  cara: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.redondo,
    backgroundColor: colores.violetaSuave,
    overflow: 'hidden',
  },
  globo: {
    flex: 1,
    backgroundColor: colores.superficieAlta,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radio.m,
    padding: espacio.m,
  },
});
