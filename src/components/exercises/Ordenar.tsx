import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { EjercicioOrdenar } from '@/types/content';
import { vibrar } from '@/lib/haptics';
import { mezclar } from '@/lib/random';
import { colores, espacio, radio } from '@/theme';

import { Texto } from '../ui/Texto';
import { Opcion } from './Opcion';

type Props = {
  ejercicio: EjercicioOrdenar;
  respuesta: string[];
  onCambiar: (respuesta: string[]) => void;
  bloqueado: boolean;
};

/** Se toca cada ítem en el orden correcto; tocar uno ya elegido lo devuelve. */
export function Ordenar({ ejercicio, respuesta, onCambiar, bloqueado }: Props) {
  const mezclados = useMemo(() => {
    // Evita mostrar los ítems ya ordenados.
    let lista = mezclar(ejercicio.items);
    for (let i = 0; i < 5 && lista.every((it, j) => it.id === ejercicio.ordenCorrecto[j]); i++) {
      lista = mezclar(ejercicio.items);
    }
    return lista;
  }, [ejercicio.items, ejercicio.ordenCorrecto]);

  const textoDe = (id: string) => ejercicio.items.find((it) => it.id === id)?.texto ?? id;

  return (
    <View style={{ gap: espacio.l }}>
      <View style={estilos.zona}>
        {respuesta.length === 0 ? (
          <Texto variante="chico" color={colores.textoSuave}>
            Tocá las opciones en orden…
          </Texto>
        ) : (
          respuesta.map((id, i) => (
            <View key={id} style={estilos.filaElegida}>
              <Texto variante="etiqueta" color={colores.violeta} style={estilos.numero}>
                {i + 1}
              </Texto>
              <View style={{ flex: 1 }}>
                <Opcion
                  compacta
                  seleccionada
                  texto={textoDe(id)}
                  deshabilitada={bloqueado}
                  onPress={() => {
                    vibrar.toque();
                    onCambiar(respuesta.filter((r) => r !== id));
                  }}
                />
              </View>
            </View>
          ))
        )}
      </View>

      <View style={estilos.disponibles}>
        {mezclados
          .filter((it) => !respuesta.includes(it.id))
          .map((it) => (
            <Opcion
              key={it.id}
              compacta
              texto={it.texto}
              deshabilitada={bloqueado}
              onPress={() => {
                vibrar.toque();
                onCambiar([...respuesta, it.id]);
              }}
            />
          ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  zona: {
    minHeight: 120,
    gap: espacio.s,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colores.borde,
    borderRadius: radio.m,
    padding: espacio.m,
    justifyContent: 'center',
  },
  filaElegida: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  numero: { width: 20, textAlign: 'center' },
  disponibles: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
});
