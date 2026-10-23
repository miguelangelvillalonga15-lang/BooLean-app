import { Pressable, StyleSheet } from 'react-native';

import { colores, espacio, fuentes, radio } from '@/theme';

import { Texto } from '../ui/Texto';

type Props = {
  texto: string;
  seleccionada?: boolean;
  deshabilitada?: boolean;
  onPress: () => void;
  compacta?: boolean;
};

/** Botón-tarjeta para elegir una opción o una palabra. */
export function Opcion({ texto, seleccionada, deshabilitada, onPress, compacta }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: seleccionada, disabled: deshabilitada }}
      disabled={deshabilitada}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        compacta && estilos.compacta,
        seleccionada && estilos.seleccionada,
        deshabilitada && estilos.deshabilitada,
        pressed && estilos.presionada,
      ]}>
      <Texto
        variante={compacta ? 'chico' : 'cuerpo'}
        color={colores.texto}
        style={compacta && estilos.textoCompacto}>
        {texto}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderRadius: radio.m,
    paddingVertical: espacio.m,
    paddingHorizontal: espacio.m,
    backgroundColor: colores.superficie,
  },
  compacta: {
    paddingVertical: espacio.s,
    paddingHorizontal: espacio.m,
  },
  textoCompacto: { fontSize: 16, fontFamily: fuentes.media },
  seleccionada: {
    borderColor: colores.violeta,
    backgroundColor: colores.violetaSuave,
  },
  deshabilitada: { opacity: 0.4 },
  presionada: { transform: [{ scale: 0.98 }] },
});
