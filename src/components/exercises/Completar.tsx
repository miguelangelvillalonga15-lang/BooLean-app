import { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import type { EjercicioCompletar } from '@/types/content';
import { vibrar } from '@/lib/haptics';
import { mezclar } from '@/lib/random';
import { colores, espacio, radio } from '@/theme';

import { Texto } from '../ui/Texto';
import { Opcion } from './Opcion';

type Props = {
  ejercicio: EjercicioCompletar;
  respuesta: string | null;
  onCambiar: (respuesta: string) => void;
  bloqueado: boolean;
};

export function Completar({ ejercicio, respuesta, onCambiar, bloqueado }: Props) {
  const [antes, despues = ''] = ejercicio.texto.split('___');
  const banco = useMemo(
    () => (ejercicio.banco ? mezclar(ejercicio.banco) : null),
    [ejercicio.banco],
  );

  return (
    <View style={{ gap: espacio.l }}>
      <View style={estilos.frase}>
        <Texto variante="subtitulo" style={estilos.textoFrase}>
          {antes}
          <Texto
            variante="subtitulo"
            color={respuesta ? colores.primario : colores.bloqueado}
            style={estilos.hueco}>
            {banco ? (respuesta ?? '______') : '______'}
          </Texto>
          {despues}
        </Texto>
      </View>

      {banco ? (
        <View style={estilos.banco}>
          {banco.map((palabra) => (
            <Opcion
              key={palabra}
              compacta
              texto={palabra}
              seleccionada={respuesta === palabra}
              deshabilitada={bloqueado && respuesta !== palabra}
              onPress={() => {
                vibrar.toque();
                onCambiar(palabra);
              }}
            />
          ))}
        </View>
      ) : (
        <TextInput
          value={respuesta ?? ''}
          onChangeText={onCambiar}
          editable={!bloqueado}
          placeholder="Escribí tu respuesta"
          placeholderTextColor={colores.textoSuave}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Tu respuesta"
          style={estilos.input}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  frase: {
    backgroundColor: colores.fondoSuave,
    borderRadius: radio.m,
    padding: espacio.m,
  },
  textoFrase: { fontWeight: '600' },
  hueco: { fontWeight: '800', textDecorationLine: 'underline' },
  banco: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  input: {
    borderWidth: 2,
    borderColor: colores.borde,
    borderRadius: radio.m,
    paddingHorizontal: espacio.m,
    paddingVertical: espacio.m,
    fontSize: 18,
    color: colores.texto,
    backgroundColor: colores.fondo,
  },
});
