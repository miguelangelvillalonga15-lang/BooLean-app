import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { colores } from '@/theme';

/** Llama de la racha: crece y se aviva cuantos más días seguidos llevás. */
export function Llama({ racha, tamano = 18 }: { racha: number; tamano?: number }) {
  const t = useSharedValue(0);
  const prendida = racha > 0;
  const escala = Math.min(1 + racha * 0.08, 1.8);
  const color = !prendida ? colores.bloqueado : racha >= 7 ? '#FF5C3A' : colores.racha;

  useEffect(() => {
    if (!prendida) return;
    // Más racha, más rápido titila.
    const duracion = Math.max(220, 480 - racha * 25);
    t.value = withRepeat(withTiming(1, { duration: duracion, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [t, prendida, racha]);

  const estilo = useAnimatedStyle(() => ({
    transform: [
      { scale: escala * (1 + t.value * 0.12) },
      { rotate: `${-4 + t.value * 8}deg` },
      { translateY: -t.value },
    ],
  }));

  return (
    <Animated.View style={estilo}>
      <Ionicons name="flame" size={tamano} color={color} />
    </Animated.View>
  );
}
