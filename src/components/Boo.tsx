import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { BooAnimo } from '@/types/content';
import { colores, espacio, fuentes, radio } from '@/theme';

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
  corazon: '#FF5C8A',
  anteojos: '#141218',
};

/** Hacia dónde mira Boo: x e y van de -1 a 1. */
export type Mirada = { x: number; y: number };

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

/** Ojo cerrado: una curva (hacia arriba si está contenta, hacia abajo si duerme o parpadea). */
function OjoCerrado({ x, y, sobreNegro, curva }: Ojo & { curva: number }) {
  return (
    <Path
      d={`M${x - 12},${y + 2} Q${x},${y + 2 + curva} ${x + 12},${y + 2}`}
      stroke={sobreNegro ? c.blanco : c.ojoBorde}
      strokeWidth={3.5}
      strokeLinecap="round"
      fill="none"
    />
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

function Ojos({ animo, mirar, parpadeo }: { animo: BooAnimo; mirar?: Mirada; parpadeo: boolean }) {
  const desvio = mirar ? [mirar.x * 5, mirar.y * 4] : undefined;
  return (
    <G>
      {OJOS.map((o) => {
        if (animo === 'enamorada') {
          return (
            <Path
              key={o.x}
              d={`M${o.x},${o.y + 10} C${o.x - 17},${o.y - 1} ${o.x - 10},${o.y - 15} ${o.x},${o.y - 5} C${o.x + 10},${o.y - 15} ${o.x + 17},${o.y - 1} ${o.x},${o.y + 10} Z`}
              fill={c.corazon}
            />
          );
        }
        if (animo === 'contenta') return <OjoCerrado key={o.x} {...o} curva={-12} />;
        if (animo === 'dormida' || parpadeo) return <OjoCerrado key={o.x} {...o} curva={6} />;
        switch (animo) {
          case 'pensando':
            return <OjoAbierto key={o.x} {...o} mirar={desvio ?? [5, -3]} />;
          case 'sorprendida':
            return (
              <G key={o.x}>
                <Circle cx={o.x} cy={o.y} r={13} fill={c.ojo} stroke={c.ojoBorde} strokeWidth={2.5} />
                <Circle cx={o.x + (desvio?.[0] ?? 0) * 0.6} cy={o.y + (desvio?.[1] ?? 0) * 0.6} r={4.5} fill={c.negro} />
                <Circle cx={o.x + 4} cy={o.y - 5} r={2.5} fill={c.blanco} />
              </G>
            );
          case 'triste':
            return (
              <G key={o.x}>
                <OjoAbierto {...o} mirar={desvio} pupila={[6, 8]} />
                <Parpado {...o} alto={4} caida={6} />
              </G>
            );
          case 'decepcionada':
            return (
              <G key={o.x}>
                <OjoAbierto {...o} mirar={desvio} />
                <Parpado {...o} alto={11} />
              </G>
            );
          default:
            return <OjoAbierto key={o.x} {...o} mirar={desvio} />;
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
    case 'enamorada':
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
    case 'dormida':
      return (
        <G>
          {centro}
          <Path d="M93,146 Q96.5,150 100,146 Q103.5,150 107,146" {...trazo} />
        </G>
      );
    default:
      return (
        <G>
          {centro}
          <Path d="M88,146 Q94,153 100,146 Q106,153 112,146" {...trazo} />
        </G>
      );
  }
}

/** Anteojos de sol para cuando venís con combo. 😎 */
function Anteojos() {
  return (
    <G>
      <Path d="M48,106 L32,100 M152,106 L168,100" stroke={c.anteojos} strokeWidth={4} strokeLinecap="round" />
      <Rect x={50} y={99} width={44} height={26} rx={10} fill={c.anteojos} />
      <Rect x={106} y={99} width={44} height={26} rx={10} fill={c.anteojos} />
      <Path d="M94,108 Q100,103 106,108" stroke={c.anteojos} strokeWidth={4} fill="none" />
      <Path d="M58,106 L70,104 M114,106 L126,104" stroke={c.blanco} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
    </G>
  );
}

type DibujoProps = {
  animo?: BooAnimo;
  /** Ancho en puntos. */
  tamano?: number;
  mirar?: Mirada;
  parpadeo?: boolean;
  anteojos?: boolean;
  /** Mueve la oreja derecha (un tic gatuno). */
  orejaMovida?: boolean;
};

/** Dibujo de Boo, sin animaciones (sirve también para generar el ícono). */
export function BooDibujo({
  animo = 'feliz',
  tamano = 96,
  mirar,
  parpadeo = false,
  anteojos = false,
  orejaMovida = false,
}: DibujoProps) {
  const rubor = animo === 'presentandose' || animo === 'contenta' || animo === 'enamorada';
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 200 200">
      {/* Pechera peluda */}
      <Path d="M48,160 L40,200 L160,200 L152,160 Z" fill={c.blanco} />
      <Path d="M58,168 L66,186 L74,170 L84,190 L92,172 L100,192 L108,172 L116,190 L126,170 L134,186 L142,168" stroke="#DCD7CF" strokeWidth={2} fill="none" strokeLinejoin="round" />

      {/* Orejas */}
      <Path d="M36,104 L44,22 Q46,15 53,20 L102,62 Z" fill={c.negro} />
      <Path d="M52,88 L55,38 L86,66 Z" fill={c.orejaAdentro} />
      <G transform={orejaMovida ? 'rotate(14 130 80)' : undefined}>
        <Path d="M164,104 L156,22 Q154,15 147,20 L98,62 Z" fill={c.negro} />
        <Path d="M148,88 L145,38 L114,66 Z" fill={c.orejaAdentro} />
        <Path d="M144,82 L138,56 M137,84 L128,62" stroke={c.blanco} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
      </G>
      <Path d="M56,82 L62,56 M63,84 L72,62" stroke={c.blanco} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />

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

      <Ojos animo={animo} mirar={mirar} parpadeo={parpadeo} />
      {anteojos ? <Anteojos /> : null}

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

/** Espera un tiempo al azar entre `min` y `max` milisegundos. */
const azar = (min: number, max: number) => min + Math.random() * (max - min);

/** Parpadeo y tic de oreja cada tanto, como una gata de verdad. */
function useTicsGatunos(activo: boolean) {
  const [parpadeo, setParpadeo] = useState(false);
  const [oreja, setOreja] = useState(false);

  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const parpadear = () => {
      timers.push(
        setTimeout(() => {
          if (!vivo) return;
          setParpadeo(true);
          timers.push(setTimeout(() => setParpadeo(false), 140));
          parpadear();
        }, azar(2500, 5500)),
      );
    };
    const moverOreja = () => {
      timers.push(
        setTimeout(() => {
          if (!vivo) return;
          setOreja(true);
          timers.push(setTimeout(() => setOreja(false), 220));
          moverOreja();
        }, azar(5000, 9000)),
      );
    };
    parpadear();
    moverOreja();
    return () => {
      vivo = false;
      timers.forEach(clearTimeout);
    };
  }, [activo]);

  return { parpadeo, oreja };
}

/** "Zzz" que flotan cuando Boo duerme. */
function Zzz({ tamano }: { tamano: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'flex-end' }]}>
      {[0, 1, 2].map((i) => (
        <Zeta key={i} retraso={i * 700} tamano={tamano} />
      ))}
    </View>
  );
}

function Zeta({ retraso, tamano }: { retraso: number; tamano: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(retraso, withRepeat(withTiming(1, { duration: 2100, easing: Easing.out(Easing.quad) }), -1));
  }, [t, retraso]);
  const estilo = useAnimatedStyle(() => ({
    opacity: t.value < 0.15 ? t.value / 0.15 : 1 - t.value,
    transform: [{ translateY: -t.value * tamano * 0.5 }, { translateX: t.value * tamano * 0.15 }, { scale: 0.7 + t.value * 0.6 }],
  }));
  return (
    <Animated.Text style={[estilos.zeta, { fontSize: Math.max(12, tamano * 0.22), top: tamano * 0.15 }, estilo]}>
      z
    </Animated.Text>
  );
}

type Props = {
  animo?: BooAnimo;
  /** Si está, Boo lo dice en un globito al costado. */
  mensaje?: string;
  tamano?: number;
  mirar?: Mirada;
  anteojos?: boolean;
  /** Respira, parpadea y mueve la oreja. Activado por defecto. */
  viva?: boolean;
  /** Si está, se puede tocar a Boo. */
  alTocar?: () => void;
};

export function Boo({ animo = 'feliz', mensaje, tamano = 64, mirar, anteojos, viva = true, alTocar }: Props) {
  const { parpadeo, oreja } = useTicsGatunos(viva);
  const respiracion = useSharedValue(0);
  const dormida = animo === 'dormida';

  useEffect(() => {
    if (!viva) return;
    respiracion.value = withRepeat(
      withSequence(
        withTiming(1, { duration: dormida ? 2200 : 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: dormida ? 2200 : 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [viva, dormida, respiracion]);

  const estiloRespiracion = useAnimatedStyle(() => ({
    transform: [
      { translateY: respiracion.value * (dormida ? 2 : -1.5) },
      { scale: 1 + respiracion.value * (dormida ? 0.035 : 0.025) },
    ],
  }));

  const dibujo = (
    <Animated.View style={estiloRespiracion}>
      <BooDibujo
        animo={animo}
        tamano={tamano}
        mirar={mirar}
        anteojos={anteojos}
        parpadeo={parpadeo}
        orejaMovida={oreja}
      />
    </Animated.View>
  );

  const contenido = (
    <View style={[estilos.cara, { width: tamano * 1.2, height: tamano * 1.2 }]}>
      {dibujo}
      {dormida && viva ? <Zzz tamano={tamano} /> : null}
    </View>
  );

  const cara = alTocar ? (
    <Pressable accessibilityRole="button" accessibilityLabel={`Boo, ${animo}. Tocala`} onPress={alTocar}>
      {contenido}
    </Pressable>
  ) : (
    <View accessible accessibilityLabel={`Boo, ${animo}`}>
      {contenido}
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
  },
  globo: {
    flex: 1,
    backgroundColor: colores.superficieAlta,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radio.m,
    padding: espacio.m,
  },
  zeta: { position: 'absolute', right: 0, color: colores.violeta, fontFamily: fuentes.monoNegrita },
});
