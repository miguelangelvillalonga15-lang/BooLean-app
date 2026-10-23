import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colores, espacio, fuentes, radio } from '@/theme';

import { Texto } from './Texto';

type Variante = 'primario' | 'secundario' | 'acierto' | 'error' | 'fantasma';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

const estilosVariante: Record<Variante, { fondo: string; texto: string; borde?: string }> = {
  primario: { fondo: colores.primario, texto: colores.textoSobrePrimario },
  acierto: { fondo: colores.acierto, texto: colores.textoSobrePrimario },
  error: { fondo: colores.error, texto: colores.blanco },
  secundario: { fondo: colores.superficieAlta, texto: colores.texto, borde: colores.borde },
  fantasma: { fondo: 'transparent', texto: colores.violeta },
};

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado, style }: Props) {
  const v = estilosVariante[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: deshabilitado ? colores.superficieAlta : v.fondo,
          borderWidth: v.borde ? 1 : 0,
          borderColor: v.borde,
          opacity: pressed && !deshabilitado ? 0.85 : 1,
          transform: [{ scale: pressed && !deshabilitado ? 0.98 : 1 }],
        },
        style,
      ]}>
      <Texto
        style={estilos.texto}
        color={deshabilitado ? colores.textoSuave : v.texto}>
        {titulo}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radio.m,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.l,
    alignSelf: 'stretch',
  },
  texto: { fontFamily: fuentes.seminegrita, fontSize: 18, lineHeight: 22 },
});
