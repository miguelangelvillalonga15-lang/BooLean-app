import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BooConOvillo } from '@/components/animaciones/BooConOvillo';
import { ContadorAnimado } from '@/components/animaciones/ContadorAnimado';
import { Odometro } from '@/components/animaciones/Odometro';
import { Sello } from '@/components/animaciones/Sello';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { Texto } from '@/components/ui/Texto';
import { frasesBoo, obtenerLeccion } from '@/content';
import { vibrar } from '@/lib/haptics';
import { elegir } from '@/lib/random';
import { sonar } from '@/lib/sonidos';
import { useProgreso } from '@/store/progress';
import { colores, espacio, radio } from '@/theme';

type Params = {
  leccion: string;
  xp: string;
  aciertos: string;
  total: string;
  pistas: string;
  perfecta: string;
  racha: string;
  rachaAntes: string;
  rachaSubio: string;
  metaCumplida: string;
  mejorCombo: string;
};

// El ticket se "imprime" renglón por renglón.
const INICIO_TICKET = 500;
const ENTRE_RENGLONES = 380;
const RENGLONES = 5;

/** Resumen de la lección, en forma de ticket. */
export default function Resultado() {
  const p = useLocalSearchParams<Params>();
  const aciertos = Number(p.aciertos ?? 0);
  const total = Number(p.total ?? 0);
  const proporcion = total === 0 ? 1 : aciertos / total;
  const perfecta = p.perfecta === '1';
  const nivel = perfecta ? 'perfecto' : proporcion >= 0.7 ? 'bien' : 'regular';
  const leccion = p.leccion ? obtenerLeccion(p.leccion) : undefined;
  const racha = Number(p.racha ?? 0);
  const rachaAntes = Number(p.rachaAntes ?? racha);
  const huellasPendientes = useProgreso((s) => s.huellasPendientes);

  const [mensaje] = useState(() => elegir(frasesBoo.resultado[nivel]));
  const [fraseMeta] = useState(() => elegir(frasesBoo.meta_cumplida));
  const finTicket = INICIO_TICKET + RENGLONES * ENTRE_RENGLONES;

  // Un "trrr" de impresora por cada renglón.
  useEffect(() => {
    const timers = Array.from({ length: RENGLONES }, (_, i) =>
      setTimeout(() => {
        sonar('impresora');
        vibrar.suave();
      }, INICIO_TICKET + i * ENTRE_RENGLONES),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const alCaerSello = useCallback(() => {
    sonar('sello');
    vibrar.golpe();
  }, []);

  const continuar = () => {
    // Si desbloqueaste una lección nueva, vamos al camino a ver las huellitas de Boo.
    if (huellasPendientes) router.dismissTo('/aprender');
    else router.back();
  };

  const retraso = (i: number) => INICIO_TICKET + i * ENTRE_RENGLONES;

  return (
    <Pantalla grilla pie={<Boton titulo="Continuar" onPress={continuar} />}>
      <View style={estilos.centro}>
        <BooConOvillo animo={nivel === 'regular' ? 'pensando' : 'presentandose'} tamano={100} />
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
          <Renglon retraso={retraso(0)} icono="star" color={colores.xp} clave="xp_ganado">
            <ContadorAnimado valor={Number(p.xp ?? 0)} prefijo="+" retraso={retraso(0)} variante="numero" />
          </Renglon>
          <Renglon retraso={retraso(1)} icono="checkmark-done" color={colores.primario} clave="aciertos">
            <ContadorAnimado valor={aciertos} sufijo={`/${total}`} retraso={retraso(1)} variante="numero" />
          </Renglon>
          <Renglon retraso={retraso(2)} icono="bulb" color={colores.violeta} clave="pistas">
            <Texto variante="numero">{p.pistas ?? '0'}</Texto>
          </Renglon>
          <Renglon retraso={retraso(3)} icono="flash" color={colores.racha} clave="mejor_combo">
            <Texto variante="numero">× {p.mejorCombo ?? '0'}</Texto>
          </Renglon>
          <Renglon retraso={retraso(4)} icono="flame" color={colores.racha} clave="racha">
            <View style={estilos.racha}>
              <Odometro desde={rachaAntes} hasta={racha} retraso={retraso(4) + 300} />
              <Texto variante="numero">{racha === 1 ? ' día' : ' días'}</Texto>
            </View>
          </Renglon>
          {perfecta ? <Sello retraso={finTicket + 200} alCaer={alCaerSello} /> : null}
        </View>

        {p.rachaSubio === '1' ? (
          <Animated.View entering={FadeInDown.delay(finTicket + 500)}>
            <Texto variante="subtitulo" color={colores.racha} style={estilos.textoCentrado}>
              🔥 ¡Tu racha subió a {racha} {racha === 1 ? 'día' : 'días'}!
            </Texto>
          </Animated.View>
        ) : null}
        {p.metaCumplida === '1' ? (
          <Animated.View entering={FadeInDown.delay(finTicket + 800)}>
            <Texto variante="subtitulo" color={colores.primario} style={estilos.textoCentrado}>
              {fraseMeta}
            </Texto>
          </Animated.View>
        ) : null}
      </View>
    </Pantalla>
  );
}

type RenglonProps = {
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  clave: string;
  retraso: number;
  children: ReactNode;
};

function Renglon({ icono, color, clave, retraso, children }: RenglonProps) {
  return (
    <Animated.View entering={FadeInDown.delay(retraso).duration(260)} style={estilos.renglon}>
      <View style={estilos.clave}>
        <Ionicons name={icono} size={16} color={color} />
        <Texto variante="codigo" color={colores.textoSuave}>
          {clave}
        </Texto>
      </View>
      <View style={estilos.puntos} />
      {children}
    </Animated.View>
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
    minHeight: 270,
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
  racha: { flexDirection: 'row', alignItems: 'center' },
});
