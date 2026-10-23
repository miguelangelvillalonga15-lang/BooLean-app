import { StyleSheet } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

import { colores } from '@/theme';

/** Cuadrícula sutil de fondo, como las celdas de una planilla. */
export function FondoGrilla({ celda = 28 }: { celda?: number }) {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="grilla" width={celda} height={celda} patternUnits="userSpaceOnUse">
          <Path d={`M${celda} 0 L0 0 0 ${celda}`} stroke={colores.grilla} strokeWidth={1} fill="none" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grilla)" />
    </Svg>
  );
}
