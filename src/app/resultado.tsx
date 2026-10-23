import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boo } from '@/components/Boo';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { Texto } from '@/components/ui/Texto';
import { frasesBoo } from '@/content';
import { elegir } from '@/lib/random';
import { colores, espacio, radio } from '@/theme';

type Params = {
  xp: string;
  aciertos: string;
  total: string;
  perfecta: string;
  racha: string;
  rachaSubio: string;
  metaCumplida: string;
};

export default function Resultado() {
  const p = useLocalSearchParams<Params>();
  const aciertos = Number(p.aciertos ?? 0);
  const total = Number(p.total ?? 0);
  const proporcion = total === 0 ? 1 : aciertos / total;
  const nivel = p.perfecta === '1' ? 'perfecto' : proporcion >= 0.7 ? 'bien' : 'regular';

  const [mensaje] = useState(() => elegir(frasesBoo.resultado[nivel]));
  const [fraseMeta] = useState(() => elegir(frasesBoo.meta_cumplida));

  return (
    <Pantalla pie={<Boton titulo="Continuar" onPress={() => router.back()} />}>
      <View style={estilos.centro}>
        <Boo animo={nivel === 'regular' ? 'pensando' : 'presentandose'} tamano={96} />
        <Texto variante="titulo" style={estilos.textoCentrado}>
          ¡Lección completada!
        </Texto>
        <Texto style={estilos.textoCentrado} color={colores.textoSuave}>
          {mensaje}
        </Texto>

        <View style={estilos.fichas}>
          <Ficha titulo="XP ganado" valor={`⭐ ${p.xp}`} color={colores.xp} />
          <Ficha titulo="Aciertos" valor={`🎯 ${aciertos}/${total}`} color={colores.acierto} />
          <Ficha titulo="Racha" valor={`🔥 ${p.racha}`} color={colores.racha} />
        </View>

        {p.rachaSubio === '1' ? (
          <Texto variante="subtitulo" color={colores.racha} style={estilos.textoCentrado}>
            ¡Tu racha subió a {p.racha} {p.racha === '1' ? 'día' : 'días'}!
          </Texto>
        ) : null}
        {p.metaCumplida === '1' ? (
          <Texto variante="subtitulo" color={colores.acierto} style={estilos.textoCentrado}>
            {fraseMeta}
          </Texto>
        ) : null}
      </View>
    </Pantalla>
  );
}

function Ficha({ titulo, valor, color }: { titulo: string; valor: string; color: string }) {
  return (
    <View style={[estilos.ficha, { borderColor: color }]}>
      <View style={[estilos.fichaTitulo, { backgroundColor: color }]}>
        <Texto variante="etiqueta" color={colores.blanco} style={estilos.textoCentrado}>
          {titulo}
        </Texto>
      </View>
      <Texto variante="subtitulo" style={estilos.fichaValor}>
        {valor}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espacio.m },
  textoCentrado: { textAlign: 'center' },
  fichas: { flexDirection: 'row', gap: espacio.s, alignSelf: 'stretch' },
  ficha: { flex: 1, borderWidth: 2, borderRadius: radio.m, overflow: 'hidden' },
  fichaTitulo: { paddingVertical: espacio.xs },
  fichaValor: { textAlign: 'center', paddingVertical: espacio.m },
});
