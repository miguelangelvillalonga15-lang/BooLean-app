import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Texto } from '@/components/ui/Texto';
import type { EstadoLeccion } from '@/engine/progreso';
import { colores, espacio, radio } from '@/theme';

type Barra = { id: string; estado: EstadoLeccion; puntaje: number };

/** Una barra por lección: su altura es el mejor puntaje que sacaste. */
export function GraficoLecciones({ barras }: { barras: Barra[] }) {
  const ALTO = 110;
  return (
    <View>
      <View style={[estilos.zona, { height: ALTO }]}>
        {barras.map((b) => (
          <View key={b.id} style={estilos.columna}>
            {b.estado === 'completada' ? (
              <>
                <Texto variante="codigo" color={colores.primario} style={estilos.valor}>
                  {Math.round(b.puntaje * 100)}%
                </Texto>
                <View
                  style={[estilos.barra, { height: Math.max(12, b.puntaje * (ALTO - 22)), backgroundColor: colores.primario }]}
                />
              </>
            ) : (
              <View
                style={[
                  estilos.barra,
                  estilos.pendiente,
                  { height: ALTO - 22 },
                  b.estado === 'disponible' && estilos.siguiente,
                ]}>
                <Ionicons
                  name={b.estado === 'disponible' ? 'play' : 'lock-closed'}
                  size={16}
                  color={b.estado === 'disponible' ? colores.violeta : colores.bloqueado}
                />
              </View>
            )}
          </View>
        ))}
      </View>
      <View style={estilos.eje} />
      <View style={estilos.etiquetas}>
        {barras.map((b, i) => (
          <Texto key={b.id} variante="etiqueta" color={colores.textoSuave} style={estilos.etiqueta}>
            L{i + 1}
          </Texto>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  zona: { flexDirection: 'row', alignItems: 'flex-end', gap: espacio.m },
  columna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  valor: { fontSize: 12, lineHeight: 16 },
  barra: { width: '100%', borderTopLeftRadius: radio.s, borderTopRightRadius: radio.s },
  pendiente: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colores.borde,
    borderBottomWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siguiente: { borderColor: colores.violeta, backgroundColor: colores.violetaSuave },
  eje: { height: 1.5, backgroundColor: colores.borde },
  etiquetas: { flexDirection: 'row', gap: espacio.m, marginTop: espacio.s },
  etiqueta: { flex: 1, textAlign: 'center' },
});
