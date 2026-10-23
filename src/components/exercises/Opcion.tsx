import { Pressable, StyleSheet } from 'react-native';

import { colores, espacio, radio } from '@/theme';

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
        color={seleccionada ? colores.primarioOscuro : colores.texto}
        style={compacta && estilos.textoCompacto}>
        {texto}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colores.borde,
    borderRadius: radio.m,
    paddingVertical: espacio.m,
    paddingHorizontal: espacio.m,
    backgroundColor: colores.fondo,
  },
  compacta: {
    paddingVertical: espacio.s,
    paddingHorizontal: espacio.m,
  },
  textoCompacto: { fontSize: 16, fontWeight: '600' },
  seleccionada: {
    borderColor: colores.primario,
    backgroundColor: colores.primarioSuave,
  },
  deshabilitada: { opacity: 0.4 },
  presionada: { transform: [{ translateY: 2 }] },
});
