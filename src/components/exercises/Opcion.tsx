import { Pressable, StyleSheet, View } from 'react-native';

import { colores, espacio, fuentes, radio } from '@/theme';

import { Texto } from '../ui/Texto';

type Props = {
  texto: string;
  seleccionada?: boolean;
  deshabilitada?: boolean;
  onPress: () => void;
  compacta?: boolean;
  /** Letra de la opción (A, B, C…), como las columnas de una planilla. */
  letra?: string;
};

/** Botón-tarjeta para elegir una opción o una palabra. */
export function Opcion({ texto, seleccionada, deshabilitada, onPress, compacta, letra }: Props) {
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
      {letra ? (
        <View style={[estilos.letra, seleccionada && estilos.letraSeleccionada]}>
          <Texto variante="etiqueta" color={seleccionada ? colores.fondo : colores.textoSuave}>
            {letra}
          </Texto>
        </View>
      ) : null}
      <Texto
        variante={compacta ? 'chico' : 'cuerpo'}
        color={colores.texto}
        style={[{ flexShrink: 1 }, compacta && estilos.textoCompacto]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.m,
  },
  letra: {
    width: 30,
    height: 30,
    borderRadius: radio.s - 2,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letraSeleccionada: { backgroundColor: colores.violeta, borderColor: colores.violeta },
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
