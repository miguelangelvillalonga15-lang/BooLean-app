import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

import { colores, espacio, fuentes, radio } from '@/theme';

import { BooDibujo } from './Boo';
import { Boton } from './ui/Boton';
import { Texto, TextoRico } from './ui/Texto';

type Props = {
  correcta: boolean;
  /** Aciertos seguidos: desde 3 se festeja el combo. */
  combo: number;
  fraseBoo: string;
  explicacion: string;
  respuestaCorrecta: string;
  onContinuar: () => void;
};

/** Panel de abajo después de responder. Tu respuesta es un booleano: VERDADERO o FALSO. */
export function PanelFeedback({ correcta, combo, fraseBoo, explicacion, respuestaCorrecta, onContinuar }: Props) {
  const color = correcta ? colores.acierto : colores.error;
  // Si te equivocás, Boo primero se sorprende 🙀 y después se pone triste.
  const [sorprendida, setSorprendida] = useState(!correcta);
  useEffect(() => {
    if (correcta) return;
    const t = setTimeout(() => setSorprendida(false), 600);
    return () => clearTimeout(t);
  }, [correcta]);

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(14)}
      accessibilityLiveRegion="polite"
      style={[estilos.panel, { backgroundColor: correcta ? colores.aciertoSuave : colores.errorSuave, borderColor: color }]}>
      <View style={estilos.titulo}>
        <View style={[estilos.cara, { borderColor: color }]}>
          <BooDibujo
            animo={correcta ? 'contenta' : sorprendida ? 'sorprendida' : 'triste'}
            anteojos={correcta && combo >= 3}
            tamano={52}
          />
        </View>
        <View style={{ flex: 1, gap: espacio.xs }}>
          <View style={estilos.chips}>
            <View style={[estilos.chip, { backgroundColor: color }]}>
              <Texto variante="etiqueta" color={colores.fondo}>
                respuesta = {correcta ? 'VERDADERO' : 'FALSO'}
              </Texto>
            </View>
            {correcta && combo >= 3 ? (
              <Animated.View entering={ZoomIn.springify().damping(8).delay(250)} style={[estilos.chip, estilos.combo]}>
                <Texto variante="etiqueta" color={colores.fondo}>
                  combo × {combo} 🔥
                </Texto>
              </Animated.View>
            ) : null}
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
    </Animated.View>
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.xs },
  chip: { alignSelf: 'flex-start', borderRadius: radio.redondo, paddingHorizontal: espacio.s, paddingVertical: 2 },
  combo: { backgroundColor: colores.racha },
});
