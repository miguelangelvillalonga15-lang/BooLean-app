import { StyleSheet, View } from 'react-native';

import { colores, radio } from '@/theme';

type Props = { valor: number; color?: string; alto?: number };

/** Barra horizontal; `valor` va de 0 a 1. */
export function BarraProgreso({ valor, color = colores.primario, alto = 12 }: Props) {
  const porcentaje = Math.min(1, Math.max(0, valor)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(porcentaje) }}
      style={[estilos.fondo, { height: alto }]}>
      <View style={[estilos.relleno, { width: `${porcentaje}%`, backgroundColor: color }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flexGrow: 1,
    alignSelf: 'stretch',
    backgroundColor: colores.superficieAlta,
    borderRadius: radio.redondo,
    overflow: 'hidden',
  },
  relleno: {
    height: '100%',
    borderRadius: radio.redondo,
  },
});
