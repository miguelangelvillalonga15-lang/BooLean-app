import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Boo } from '@/components/Boo';
import { BarraProgreso } from '@/components/ui/BarraProgreso';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { Texto } from '@/components/ui/Texto';
import { curso, frasesBoo, obtenerLeccion } from '@/content';
import {
  estadoLeccion,
  META_XP,
  siguienteLeccion,
  xpDeHoy,
  type EstadoLeccion,
} from '@/engine/progreso';
import { claveDia, rachaVigente } from '@/engine/streak';
import { useProgreso } from '@/store/progress';
import { colores, espacio, radio } from '@/theme';
import type { BooAnimo } from '@/types/content';

export default function Inicio() {
  const progreso = useProgreso();
  const hoy = claveDia();
  const racha = rachaVigente(progreso.racha, hoy);
  const metaXp = progreso.perfil ? META_XP[progreso.perfil.metaMinutos] : META_XP[10];
  const xpHoy = xpDeHoy(progreso, hoy);
  const metaCumplida = xpHoy >= metaXp;
  const siguiente = siguienteLeccion(curso, progreso);

  // Boo reacciona a la situación (racha, meta); la semilla mantiene fija la frase elegida.
  const [semilla] = useState(Math.random);
  const frase = (lista: string[]) => lista[Math.floor(semilla * lista.length)];
  const boo: { animo: BooAnimo; mensaje: string } = racha.perdida
    ? { animo: 'decepcionada', mensaje: frase(frasesBoo.racha_perdida) }
    : metaCumplida
      ? { animo: 'contenta', mensaje: frase(frasesBoo.meta_cumplida) }
      : {
          animo: 'feliz',
          mensaje: frase(frasesBoo.saludo).replace('{nombre}', progreso.perfil?.nombre ?? ''),
        };

  if (!progreso.perfil) return <Redirect href="/bienvenida" />;

  const abrir = (id: string) => router.push({ pathname: '/leccion/[id]', params: { id } });

  return (
    <Pantalla
      pie={
        siguiente ? (
          <Boton titulo="Seguir aprendiendo" onPress={() => abrir(siguiente)} />
        ) : (
          <Boton titulo="Ver glosario" variante="secundario" onPress={() => router.push('/glosario')} />
        )
      }>
      <View style={estilos.barraSuperior}>
        <Texto variante="subtitulo" color={colores.primario}>
          BooLean
        </Texto>
        <View style={estilos.contadores}>
          <View style={estilos.contador} accessibilityLabel={`Racha de ${racha.actual} días`}>
            <Texto variante="subtitulo">🔥</Texto>
            <Texto variante="subtitulo" color={racha.actual > 0 ? colores.racha : colores.bloqueado}>
              {racha.actual}
            </Texto>
          </View>
          <View style={estilos.contador} accessibilityLabel={`${progreso.xpTotal} puntos de experiencia`}>
            <Texto variante="subtitulo">⭐</Texto>
            <Texto variante="subtitulo" color={colores.xp}>
              {progreso.xpTotal}
            </Texto>
          </View>
        </View>
      </View>

      <Boo animo={boo.animo} mensaje={boo.mensaje} />

      <View style={estilos.tarjeta}>
        <View style={estilos.filaEntre}>
          <Texto variante="etiqueta" color={colores.textoSuave}>
            Meta de hoy
          </Texto>
          <Texto variante="chico" color={metaCumplida ? colores.acierto : colores.textoSuave}>
            {Math.min(xpHoy, metaXp)} / {metaXp} XP {metaCumplida ? '✓' : ''}
          </Texto>
        </View>
        <BarraProgreso valor={xpHoy / metaXp} color={colores.xp} />
      </View>

      {curso.unidades.map((unidad, u) => (
        <View key={unidad.id} style={estilos.unidad}>
          <View style={estilos.cabeceraUnidad}>
            <Texto variante="etiqueta" color={colores.primarioSuave}>
              Unidad {u + 1} · {curso.niveles.find((n) => n.id === unidad.nivel)?.titulo}
            </Texto>
            <Texto variante="subtitulo" color={colores.blanco}>
              {unidad.titulo}
            </Texto>
            <Texto variante="chico" color={colores.primarioSuave}>
              {unidad.descripcion}
            </Texto>
          </View>

          {unidad.lecciones.map((id, i) => (
            <NodoLeccion
              key={id}
              numero={i + 1}
              titulo={obtenerLeccion(id)?.titulo ?? id}
              estado={estadoLeccion(curso, progreso, id)}
              desplazamiento={[0, 1, 0, -1][i % 4]}
              onPress={() => abrir(id)}
            />
          ))}
        </View>
      ))}

      <View style={[estilos.tarjeta, estilos.proximamente]}>
        <Texto variante="chico" color={colores.textoSuave}>
          🔒 Próximamente: Unidad 2 · Excel desde cero
        </Texto>
      </View>

      <Boton titulo="📖 Glosario" variante="secundario" onPress={() => router.push('/glosario')} />
    </Pantalla>
  );
}

type NodoProps = {
  numero: number;
  titulo: string;
  estado: EstadoLeccion;
  /** -1, 0 o 1: corre el nodo a un costado para dibujar un camino en zigzag. */
  desplazamiento: number;
  onPress: () => void;
};

function NodoLeccion({ numero, titulo, estado, desplazamiento, onPress }: NodoProps) {
  const bloqueada = estado === 'bloqueada';
  const icono = estado === 'completada' ? '✓' : bloqueada ? '🔒' : '★';
  const fondo =
    estado === 'completada' ? colores.xp : bloqueada ? colores.borde : colores.primario;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lección ${numero}: ${titulo}. ${
        estado === 'completada' ? 'Completada' : bloqueada ? 'Bloqueada' : 'Disponible'
      }`}
      accessibilityState={{ disabled: bloqueada }}
      disabled={bloqueada}
      onPress={onPress}
      style={[estilos.nodo, { transform: [{ translateX: desplazamiento * 60 }] }]}>
      {({ pressed }) => (
        <>
          <View
            style={[
              estilos.circulo,
              { backgroundColor: fondo, transform: [{ translateY: pressed ? 3 : 0 }] },
            ]}>
            <Texto variante="titulo" color={colores.blanco}>
              {icono}
            </Texto>
          </View>
          <Texto
            variante="chico"
            color={bloqueada ? colores.textoSuave : colores.texto}
            style={estilos.tituloNodo}>
            {numero}. {titulo}
          </Texto>
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  barraSuperior: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contadores: { flexDirection: 'row', gap: espacio.m },
  contador: { flexDirection: 'row', alignItems: 'center', gap: espacio.xs },
  tarjeta: {
    gap: espacio.s,
    borderWidth: 2,
    borderColor: colores.borde,
    borderRadius: radio.m,
    padding: espacio.m,
  },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  unidad: { gap: espacio.l, alignItems: 'center' },
  cabeceraUnidad: {
    alignSelf: 'stretch',
    gap: espacio.xs,
    backgroundColor: colores.primario,
    borderRadius: radio.m,
    padding: espacio.m,
  },
  nodo: { alignItems: 'center', gap: espacio.s, width: 220 },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: radio.redondo,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.18)',
  },
  tituloNodo: { textAlign: 'center' },
  proximamente: { alignItems: 'center', borderStyle: 'dashed' },
});
