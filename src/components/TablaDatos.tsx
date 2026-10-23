import { ScrollView, StyleSheet, View } from 'react-native';

import type { Tabla } from '@/types/content';
import { colores, espacio, fuentes, radio } from '@/theme';

import { Texto } from './ui/Texto';

/** Tabla chica para ejemplos y ejercicios. Las celdas vacías se marcan como "(vacío)". */
export function TablaDatos({ tabla }: { tabla: Tabla }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={estilos.tabla}>
        <View style={[estilos.fila, estilos.encabezado]}>
          {tabla.columnas.map((col, i) => (
            <View key={i} style={estilos.celda}>
              <Texto variante="chico" style={estilos.negrita} color={colores.primario}>
                {col}
              </Texto>
            </View>
          ))}
        </View>
        {tabla.filas.map((fila, f) => (
          <View key={f} style={[estilos.fila, f % 2 === 1 && estilos.filaPar]}>
            {fila.map((valor, c) => (
              <View key={c} style={estilos.celda}>
                {valor === '' ? (
                  <Texto variante="chico" color={colores.error} style={estilos.vacio}>
                    (vacío)
                  </Texto>
                ) : (
                  <Texto variante="chico">{valor}</Texto>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tabla: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.s,
    backgroundColor: colores.fondo,
    overflow: 'hidden',
  },
  fila: { flexDirection: 'row' },
  encabezado: { backgroundColor: colores.superficieAlta },
  filaPar: { backgroundColor: colores.superficie },
  celda: {
    minWidth: 96,
    maxWidth: 180,
    paddingHorizontal: espacio.s,
    paddingVertical: espacio.s,
    borderRightWidth: 1,
    borderColor: colores.borde,
  },
  negrita: { fontFamily: fuentes.negrita },
  vacio: { fontFamily: fuentes.media },
});
