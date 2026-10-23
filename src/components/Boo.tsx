import { StyleSheet, View } from 'react-native';

import type { BooAnimo } from '@/types/content';
import { colores, espacio, radio } from '@/theme';

import { Texto } from './ui/Texto';

// Boo provisoria: un emoji de gata según el ánimo. Más adelante se reemplaza por ilustraciones.
const caras: Record<BooAnimo, string> = {
  feliz: '😺',
  contenta: '😸',
  presentandose: '😻',
  pensando: '😼',
  triste: '😿',
  decepcionada: '😾',
  sorprendida: '🙀',
};

type Props = {
  animo?: BooAnimo;
  /** Si está, Boo lo dice en un globito al costado. */
  mensaje?: string;
  tamano?: number;
};

export function Boo({ animo = 'feliz', mensaje, tamano = 64 }: Props) {
  const cara = (
    <View
      accessible
      accessibilityLabel={`Boo, ${animo}`}
      style={[estilos.cara, { width: tamano * 1.3, height: tamano * 1.3 }]}>
      <Texto style={{ fontSize: tamano, lineHeight: tamano * 1.2 }}>{caras[animo]}</Texto>
    </View>
  );

  if (!mensaje) return cara;

  return (
    <View style={estilos.fila}>
      {cara}
      <View style={estilos.globo}>
        <Texto variante="chico">{mensaje}</Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  cara: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.redondo,
    backgroundColor: colores.primarioSuave,
  },
  globo: {
    flex: 1,
    backgroundColor: colores.fondoSuave,
    borderColor: colores.borde,
    borderWidth: 2,
    borderRadius: radio.m,
    padding: espacio.m,
  },
});
