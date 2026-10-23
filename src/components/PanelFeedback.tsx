import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { colores, espacio, fuentes, radio } from '@/theme';

import { Boton } from './ui/Boton';
import { Texto, TextoRico } from './ui/Texto';

type Props = {
  correcta: boolean;
  fraseBoo: string;
  explicacion: string;
  respuestaCorrecta: string;
  onContinuar: () => void;
};

/** Panel de abajo después de responder: verde si acertaste, rojo si no. */
export function PanelFeedback({ correcta, fraseBoo, explicacion, respuestaCorrecta, onContinuar }: Props) {
  const color = correcta ? colores.acierto : colores.error;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[estilos.panel, { backgroundColor: correcta ? colores.aciertoSuave : colores.errorSuave }]}>
      <View style={estilos.titulo}>
        <Ionicons name={correcta ? 'checkmark-circle' : 'close-circle'} size={28} color={color} />
        <Texto variante="subtitulo" color={color} style={{ flex: 1 }}>
          {fraseBoo}
        </Texto>
      </View>
      {!correcta ? (
        <Texto variante="chico" color={color}>
          Respuesta correcta: <Texto variante="chico" color={color} style={{ fontFamily: fuentes.negrita }}>{respuestaCorrecta}</Texto>
        </Texto>
      ) : null}
      <TextoRico variante="chico">{explicacion}</TextoRico>
      <Boton titulo="Continuar" variante={correcta ? 'acierto' : 'error'} onPress={onContinuar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  panel: {
    gap: espacio.s,
    padding: espacio.m,
    borderRadius: radio.l,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
});
