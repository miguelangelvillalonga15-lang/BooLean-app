import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colores, espacio, radio } from '@/theme';

import { Texto } from './Texto';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'acierto' | 'error' | 'fantasma';
  deshabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

const fondos = {
  primario: [colores.primario, colores.primarioOscuro],
  acierto: [colores.acierto, '#17784F'],
  error: [colores.error, '#B5363A'],
  secundario: [colores.fondo, colores.borde],
  fantasma: ['transparent', 'transparent'],
} as const;

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado, style }: Props) {
  const [fondo, sombra] = fondos[variante];
  const textoOscuro = variante === 'secundario' || variante === 'fantasma';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: deshabilitado ? colores.borde : fondo,
          borderBottomColor: deshabilitado ? colores.bloqueado : sombra,
          borderWidth: variante === 'secundario' ? 2 : 0,
          borderColor: colores.borde,
          borderBottomWidth: variante === 'fantasma' ? 0 : 4,
          transform: [{ translateY: pressed && !deshabilitado ? 2 : 0 }],
        },
        style,
      ]}>
      <Texto
        variante="etiqueta"
        color={deshabilitado ? colores.textoSuave : textoOscuro ? colores.primario : colores.blanco}>
        {titulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radio.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.l,
    alignSelf: 'stretch',
  },
});
