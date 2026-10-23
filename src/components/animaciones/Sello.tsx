import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';

import { Texto } from '@/components/ui/Texto';
import { colores, espacio, radio } from '@/theme';

/** Sello de goma que cae y rebota sobre el ticket cuando la lección fue perfecta. */
export function Sello({ retraso = 0, alCaer }: { retraso?: number; alCaer?: () => void }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(retraso, withSpring(1, { damping: 9, stiffness: 140 }));
    const aviso = alCaer ? setTimeout(alCaer, retraso + 120) : undefined;
    return () => clearTimeout(aviso);
  }, [t, retraso, alCaer]);

  const opacidad = useSharedValue(0);
  useEffect(() => {
    opacidad.value = withDelay(retraso, withTiming(1, { duration: 120 }));
  }, [opacidad, retraso]);

  const estilo = useAnimatedStyle(() => ({
    opacity: opacidad.value,
    transform: [{ scale: 3 - 2 * t.value }, { rotate: '-12deg' }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[estilos.sello, estilo]}>
      <Texto variante="etiqueta" color={colores.primario} style={estilos.texto}>
        perfecta
      </Texto>
      <Texto variante="numero" color={colores.primario}>
        VERDADERO
      </Texto>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  sello: {
    position: 'absolute',
    right: espacio.s,
    top: -espacio.m,
    borderWidth: 3,
    borderColor: colores.primario,
    borderRadius: radio.s,
    paddingHorizontal: espacio.m,
    paddingVertical: espacio.xs,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 13, 23, 0.85)',
  },
  texto: { fontSize: 11 },
});
