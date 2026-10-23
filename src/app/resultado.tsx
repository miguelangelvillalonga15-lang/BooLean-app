import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boo } from '@/components/Boo';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { Texto } from '@/components/ui/Texto';
import { frasesBoo, obtenerLeccion } from '@/content';
import { elegir } from '@/lib/random';
import { colores, espacio, radio } from '@/theme';

type Params = {
  leccion: string;
  xp: string;
  aciertos: string;
  total: string;
  pistas: string;
  perfecta: string;
  racha: string;
  rachaSubio: string;
  metaCumplida: string;
};

/** Resumen de la lección, en forma de ticket. */
export default function Resultado() {
  const p = useLocalSearchParams<Params>();
  const aciertos = Number(p.aciertos ?? 0);
  const total = Number(p.total ?? 0);
  const proporcion = total === 0 ? 1 : aciertos / total;
  const nivel = p.perfecta === '1' ? 'perfecto' : proporcion >= 0.7 ? 'bien' : 'regular';
  const leccion = p.leccion ? obtenerLeccion(p.leccion) : undefined;

  const [mensaje] = useState(() => elegir(frasesBoo.resultado[nivel]));
  const [fraseMeta] = useState(() => elegir(frasesBoo.meta_cumplida));

  return (
    <Pantalla grilla pie={<Boton titulo="Continuar" onPress={() => router.back()} />}>
      <View style={estilos.centro}>
        <Boo animo={nivel === 'regular' ? 'pensando' : 'presentandose'} tamano={110} />
        <Texto variante="titulo" style={estilos.textoCentrado}>
          ¡Lección completada!
        </Texto>
        <Texto style={estilos.textoCentrado} color={colores.textoSuave}>
          {mensaje}
        </Texto>

        <View style={estilos.ticket}>
          <View style={estilos.ticketEncabezado}>
            <Texto variante="etiqueta" color={colores.textoSuave}>
              Resumen
            </Texto>
            <Texto variante="etiqueta" color={colores.textoSuave}>
              {p.leccion?.toUpperCase().replace('-', '·')}
            </Texto>
          </View>
          {leccion ? (
            <Texto variante="chico" color={colores.textoSuave}>
              {leccion.titulo}
            </Texto>
          ) : null}
          <View style={estilos.corte} />
          <Renglon icono="star" color={colores.xp} clave="xp_ganado" valor={`+${p.xp}`} />
          <Renglon icono="checkmark-done" color={colores.primario} clave="aciertos" valor={`${aciertos}/${total}`} />
          <Renglon icono="bulb" color={colores.violeta} clave="pistas" valor={p.pistas ?? '0'} />
          <Renglon icono="flame" color={colores.racha} clave="racha" valor={`${p.racha} ${p.racha === '1' ? 'día' : 'días'}`} />
          <View style={estilos.corte} />
          <View style={estilos.renglon}>
            <View style={estilos.clave}>
              <Ionicons name="sparkles" size={16} color={colores.rosa} />
              <Texto variante="codigo" color={colores.textoSuave}>
                perfecta
              </Texto>
            </View>
            <View style={estilos.puntos} />
            <Texto variante="numero" color={p.perfecta === '1' ? colores.primario : colores.rosa}>
              {p.perfecta === '1' ? 'VERDADERO' : 'FALSO'}
            </Texto>
          </View>
        </View>

        {p.rachaSubio === '1' ? (
          <Texto variante="subtitulo" color={colores.racha} style={estilos.textoCentrado}>
            🔥 ¡Tu racha subió a {p.racha} {p.racha === '1' ? 'día' : 'días'}!
          </Texto>
        ) : null}
        {p.metaCumplida === '1' ? (
          <Texto variante="subtitulo" color={colores.primario} style={estilos.textoCentrado}>
            {fraseMeta}
          </Texto>
        ) : null}
      </View>
    </Pantalla>
  );
}

type RenglonProps = {
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  clave: string;
  valor: string;
};

function Renglon({ icono, color, clave, valor }: RenglonProps) {
  return (
    <View style={estilos.renglon}>
      <View style={estilos.clave}>
        <Ionicons name={icono} size={16} color={color} />
        <Texto variante="codigo" color={colores.textoSuave}>
          {clave}
        </Texto>
      </View>
      <View style={estilos.puntos} />
      <Texto variante="numero">{valor}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espacio.m },
  textoCentrado: { textAlign: 'center' },
  ticket: {
    alignSelf: 'stretch',
    gap: espacio.s,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.m,
    padding: espacio.m + 4,
  },
  ticketEncabezado: { flexDirection: 'row', justifyContent: 'space-between' },
  corte: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colores.borde, marginVertical: espacio.xs },
  renglon: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  clave: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  puntos: {
    flex: 1,
    borderBottomWidth: 1.5,
    borderStyle: 'dotted',
    borderColor: colores.borde,
    marginTop: 8,
  },
});
