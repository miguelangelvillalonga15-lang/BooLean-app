import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { colores, fuentes } from '@/theme';

type Props = { desde: number; hasta: number; retraso?: number; tamano?: number; color?: string };

/** Número que gira como un cuentakilómetros: el viejo sube y entra el nuevo desde abajo. */
export function Odometro({ desde, hasta, retraso = 0, tamano = 20, color = colores.texto }: Props) {
  const t = useSharedValue(desde === hasta ? 1 : 0);
  const alto = tamano * 1.25;

  useEffect(() => {
    if (desde !== hasta) {
      t.value = withDelay(retraso, withTiming(1, { duration: 650, easing: Easing.out(Easing.back(1.6)) }));
    }
  }, [t, desde, hasta, retraso]);

  const viejo = useAnimatedStyle(() => ({ transform: [{ translateY: -alto * t.value }], opacity: 1 - t.value }));
  const nuevo = useAnimatedStyle(() => ({ transform: [{ translateY: alto * (1 - t.value) }], opacity: t.value }));
  const texto = { fontSize: tamano, lineHeight: alto, color, fontFamily: fuentes.monoNegrita };

  return (
    <View style={[estilos.caja, { height: alto }]}>
      {desde !== hasta ? <Animated.Text style={[texto, estilos.absoluto, viejo]}>{desde}</Animated.Text> : null}
      <Animated.Text style={[texto, nuevo]}>{hasta}</Animated.Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { overflow: 'hidden', justifyContent: 'center' },
  absoluto: { position: 'absolute' },
});
