import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colores, espacio, radio } from '@/theme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Caja con fondo y borde suave. Si tiene onPress, se puede tocar. */
export function Tarjeta({ children, onPress, accessibilityLabel, style }: Props) {
  if (!onPress) return <View style={[estilos.tarjeta, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [estilos.tarjeta, style, pressed && estilos.presionada]}>
      {children}
    </Pressable>
  );
}

type IconoProps = {
  nombre: ComponentProps<typeof Ionicons>['name'];
  color: string;
  tamano?: number;
};

/** Ícono dentro de un círculo de color, como en las tarjetas del inicio. */
export function IconoCirculo({ nombre, color, tamano = 48 }: IconoProps) {
  return (
    <View
      style={[estilos.circulo, { width: tamano, height: tamano, backgroundColor: color }]}>
      <Ionicons name={nombre} size={tamano * 0.5} color={colores.blanco} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radio.l,
    padding: espacio.m,
    gap: espacio.s,
  },
  presionada: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  circulo: { borderRadius: radio.redondo, alignItems: 'center', justifyContent: 'center' },
});
