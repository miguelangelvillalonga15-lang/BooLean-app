import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { Boo } from '@/components/Boo';
import type { BooAnimo } from '@/types/content';
import { colores } from '@/theme';

const IDA = 1500;

/** Boo mira cómo un ovillo de lana rueda de un lado al otro. */
export function BooConOvillo({ animo, tamano = 110 }: { animo: BooAnimo; tamano?: number }) {
  const x = useSharedValue(0);
  const [lado, setLado] = useState(1);
  const recorrido = tamano * 0.9;

  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: IDA, easing: Easing.inOut(Easing.quad) }), -1, true);
    // Los ojos de Boo siguen al ovillo.
    const t = setInterval(() => setLado((l) => -l), IDA);
    return () => clearInterval(t);
  }, [x]);

  const estiloOvillo = useAnimatedStyle(() => ({
    transform: [
      { translateX: (x.value * 2 - 1) * recorrido },
      { rotate: `${(x.value * 2 - 1) * 360}deg` },
    ],
  }));

  return (
    <View style={estilos.contenedor}>
      <Boo animo={animo} tamano={tamano} mirar={{ x: lado * 0.9, y: 0.8 }} />
      <Animated.View style={[estilos.ovillo, estiloOvillo]}>
        <Ovillo />
      </Animated.View>
    </View>
  );
}

function Ovillo({ tamano = 30 }: { tamano?: number }) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={17} fill={colores.rosa} />
      <Path d="M6,14 Q20,22 34,12 M4,22 Q20,30 36,20 M9,31 Q20,36 31,30" stroke="#E0607A" strokeWidth={2} fill="none" />
      <Path d="M14,4 Q22,20 12,36 M24,4 Q30,20 22,37" stroke="#FFC2CE" strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center', paddingBottom: 30 },
  ovillo: { position: 'absolute', bottom: 0 },
});
