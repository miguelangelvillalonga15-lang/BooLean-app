import { StyleSheet, View } from 'react-native';

import { colores, espacio, radio } from '@/theme';

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
      <Texto variante="subtitulo" color={color}>
        {correcta ? '😺 ' : '😿 '}
        {fraseBoo}
      </Texto>
      {!correcta ? (
        <Texto variante="chico" color={color}>
          Respuesta correcta: {respuestaCorrecta}
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
  },
});
