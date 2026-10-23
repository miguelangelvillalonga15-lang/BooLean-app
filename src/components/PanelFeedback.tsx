import { StyleSheet, View } from 'react-native';

import { colores, espacio, fuentes, radio } from '@/theme';

import { BooDibujo } from './Boo';
import { Boton } from './ui/Boton';
import { Texto, TextoRico } from './ui/Texto';

type Props = {
  correcta: boolean;
  fraseBoo: string;
  explicacion: string;
  respuestaCorrecta: string;
  onContinuar: () => void;
};

/** Panel de abajo después de responder. Tu respuesta es un booleano: VERDADERO o FALSO. */
export function PanelFeedback({ correcta, fraseBoo, explicacion, respuestaCorrecta, onContinuar }: Props) {
  const color = correcta ? colores.acierto : colores.error;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[estilos.panel, { backgroundColor: correcta ? colores.aciertoSuave : colores.errorSuave, borderColor: color }]}>
      <View style={estilos.titulo}>
        <View style={[estilos.cara, { borderColor: color }]}>
          <BooDibujo animo={correcta ? 'contenta' : 'triste'} tamano={52} />
        </View>
        <View style={{ flex: 1, gap: espacio.xs }}>
          <View style={[estilos.chip, { backgroundColor: color }]}>
            <Texto variante="etiqueta" color={colores.fondo}>
              respuesta = {correcta ? 'VERDADERO' : 'FALSO'}
            </Texto>
          </View>
          <Texto variante="subtitulo" color={color}>
            {fraseBoo}
          </Texto>
        </View>
      </View>
      {!correcta ? (
        <Texto variante="chico" color={color}>
          Correcta: <Texto variante="chico" color={color} style={{ fontFamily: fuentes.negrita }}>{respuestaCorrecta}</Texto>
        </Texto>
      ) : null}
      <TextoRico variante="chico">{explicacion}</TextoRico>
      <Boton titulo="Continuar" variante={correcta ? 'acierto' : 'error'} onPress={onContinuar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  panel: {
    gap: espacio.s + 4,
    padding: espacio.m,
    borderRadius: radio.l,
    borderWidth: 1.5,
  },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  cara: {
    width: 60,
    height: 60,
    borderRadius: radio.redondo,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colores.superficie,
  },
  chip: { alignSelf: 'flex-start', borderRadius: radio.redondo, paddingHorizontal: espacio.s, paddingVertical: 2 },
});
