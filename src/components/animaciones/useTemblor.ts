import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

/** Sacudida de costado para cuando la respuesta es incorrecta. */
export function useTemblor() {
  const x = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const temblar = useCallback(() => {
    x.set(
      withSequence(
        withTiming(-12, { duration: 50 }),
        withRepeat(withTiming(12, { duration: 80 }), 4, true),
        withTiming(0, { duration: 50 }),
      ),
    );
  }, [x]);
  return { estilo, temblar };
}
