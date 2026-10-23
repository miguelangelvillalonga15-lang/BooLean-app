import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

type Props = { alto: number; retraso?: number; style?: StyleProp<ViewStyle>; children?: ReactNode };

/** Barra de gráfico que crece desde cero hasta su altura. */
export function BarraCrece({ alto, retraso = 0, style, children }: Props) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withDelay(retraso, withTiming(alto, { duration: 700, easing: Easing.out(Easing.back(1.2)) }));
  }, [h, alto, retraso]);
  const estilo = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[style, estilo]}>{children}</Animated.View>;
}
