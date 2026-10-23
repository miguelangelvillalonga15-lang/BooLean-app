import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { colores, fuentes } from '@/theme';

const FICHAS = ['VERDADERO', 'TRUE', '1', '✓', '1', 'TRUE', '✓', 'VERDADERO'];
const COLORES = [colores.primario, colores.violeta, colores.xp, colores.rosa];
const CANTIDAD = 16;

/** Confeti de booleanos cuando acertás. Cada cambio de `disparo` lanza una lluvia nueva. */
export function LluviaBooleanos({ disparo }: { disparo: number }) {
  if (disparo === 0) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: CANTIDAD }, (_, i) => (
        <Particula key={`${disparo}-${i}`} indice={i} />
      ))}
    </View>
  );
}

function Particula({ indice }: { indice: number }) {
  const [p] = useState(() => ({
    texto: FICHAS[indice % FICHAS.length],
    color: COLORES[indice % COLORES.length],
    dx: (Math.random() - 0.5) * 340,
    alto: 260 + Math.random() * 260,
    giro: (Math.random() - 0.5) * 120,
    retraso: Math.random() * 120,
    tamano: 13 + Math.random() * 9,
  }));
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(p.retraso, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [t, p.retraso]);

  const estilo = useAnimatedStyle(() => ({
    opacity: t.value < 0.7 ? 1 : 1 - (t.value - 0.7) / 0.3,
    transform: [
      { translateX: p.dx * t.value },
      // Sube y empieza a caer, como confeti
      { translateY: -p.alto * t.value + 180 * t.value * t.value },
      { rotate: `${p.giro * t.value}deg` },
      { scale: 0.4 + Math.min(1, t.value * 3) * 0.6 },
    ],
  }));

  return (
    <Animated.Text style={[estilos.ficha, { color: p.color, fontSize: p.tamano }, estilo]}>
      {p.texto}
    </Animated.Text>
  );
}

const estilos = StyleSheet.create({
  ficha: { position: 'absolute', left: '45%', bottom: '22%', fontFamily: fuentes.monoNegrita },
});
