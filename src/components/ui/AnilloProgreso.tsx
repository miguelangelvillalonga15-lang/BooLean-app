import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { colores } from '@/theme';

import { Texto } from './Texto';

type Props = { valor: number; tamano?: number; grosor?: number };

/** Anillo de progreso con el porcentaje en el centro; `valor` va de 0 a 1. */
export function AnilloProgreso({ valor, tamano = 150, grosor = 10 }: Props) {
  const v = Math.min(1, Math.max(0, valor));
  const r = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * r;
  const centro = tamano / 2;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={{ width: tamano, height: tamano }}>
      <Svg width={tamano} height={tamano}>
        <Defs>
          <LinearGradient id="anillo" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colores.primario} />
            <Stop offset="1" stopColor={colores.violeta} />
          </LinearGradient>
        </Defs>
        <Circle cx={centro} cy={centro} r={r} fill={colores.fondo} stroke={colores.superficieAlta} strokeWidth={grosor} />
        <Circle
          cx={centro}
          cy={centro}
          r={r}
          fill="none"
          stroke="url(#anillo)"
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          // Un mínimo visible para que se note el punto de partida.
          strokeDashoffset={circunferencia * (1 - Math.max(v, 0.02))}
          transform={`rotate(-90 ${centro} ${centro})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, estilos.centro]}>
        <Texto variante="titulo">{Math.round(v * 100)}%</Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center' },
});
