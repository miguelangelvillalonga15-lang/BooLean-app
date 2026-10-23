import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BooDibujo } from '@/components/Boo';
import { Pantalla } from '@/components/ui/Pantalla';
import { Tarjeta } from '@/components/ui/Tarjeta';
import { Texto } from '@/components/ui/Texto';
import { curso, obtenerLeccion } from '@/content';
import { estadoLeccion, type EstadoLeccion } from '@/engine/progreso';
import { useProgreso } from '@/store/progress';
import { colores, espacio, radio } from '@/theme';

/** Mapa de unidades y lecciones, en forma de camino. */
export default function Aprender() {
  const progreso = useProgreso();
  const abrir = (id: string) => router.push({ pathname: '/leccion/[id]', params: { id } });

  return (
    <Pantalla bordes={['top']}>
      <Texto variante="titulo">Tu camino</Texto>

      {curso.unidades.map((unidad, u) => (
        <View key={unidad.id} style={estilos.unidad}>
          <LinearGradient
            colors={[colores.violetaOscuro, colores.violeta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.cabecera}>
            <View style={{ flex: 1, gap: espacio.xs }}>
              <Texto variante="etiqueta" color="rgba(255,255,255,0.75)">
                Unidad {u + 1} · {curso.niveles.find((n) => n.id === unidad.nivel)?.titulo}
              </Texto>
              <Texto variante="subtitulo">{unidad.titulo}</Texto>
              <Texto variante="chico" color="rgba(255,255,255,0.75)">
                {unidad.descripcion}
              </Texto>
            </View>
            <BooDibujo animo="contenta" tamano={72} />
          </LinearGradient>

          {unidad.lecciones.map((id, i) => {
            const leccion = obtenerLeccion(id);
            return (
              <NodoLeccion
                key={id}
                numero={i + 1}
                titulo={leccion?.titulo ?? id}
                minutos={leccion?.minutos ?? 0}
                estado={estadoLeccion(curso, progreso, id)}
                desplazamiento={[0, 1, 0, -1][i % 4]}
                onPress={() => abrir(id)}
              />
            );
          })}
        </View>
      ))}

      <Tarjeta style={estilos.proximo}>
        <Ionicons name="lock-closed" size={20} color={colores.textoSuave} />
        <Texto variante="chico" color={colores.textoSuave}>
          Próximamente: Unidad 2 · Excel desde cero
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}

type NodoProps = {
  numero: number;
  titulo: string;
  minutos: number;
  estado: EstadoLeccion;
  /** -1, 0 o 1: corre el nodo a un costado para dibujar un camino en zigzag. */
  desplazamiento: number;
  onPress: () => void;
};

function NodoLeccion({ numero, titulo, minutos, estado, desplazamiento, onPress }: NodoProps) {
  const bloqueada = estado === 'bloqueada';
  const actual = estado === 'disponible';
  const icono = estado === 'completada' ? 'checkmark' : bloqueada ? 'lock-closed' : 'star';
  const fondo = estado === 'completada' ? colores.primario : actual ? colores.violeta : colores.superficieAlta;
  const colorIcono = estado === 'completada' ? colores.textoSobrePrimario : bloqueada ? colores.textoSuave : colores.blanco;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lección ${numero}: ${titulo}. ${
        estado === 'completada' ? 'Completada' : bloqueada ? 'Bloqueada' : 'Disponible'
      }`}
      accessibilityState={{ disabled: bloqueada }}
      disabled={bloqueada}
      onPress={onPress}
      style={[estilos.nodo, { transform: [{ translateX: desplazamiento * 56 }] }]}>
      {({ pressed }) => (
        <>
          <View style={[estilos.halo, actual && estilos.haloActivo]}>
            <View
              style={[
                estilos.circulo,
                { backgroundColor: fondo, transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}>
              <Ionicons name={icono} size={30} color={colorIcono} />
            </View>
          </View>
          <Texto
            variante="chico"
            color={bloqueada ? colores.textoSuave : colores.texto}
            style={estilos.tituloNodo}>
            {titulo}
          </Texto>
          {actual ? (
            <Texto variante="etiqueta" color={colores.violeta}>
              Empezar · {minutos} min
            </Texto>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  unidad: { gap: espacio.l, alignItems: 'center' },
  cabecera: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    borderRadius: radio.l,
    padding: espacio.m,
  },
  nodo: { alignItems: 'center', gap: espacio.xs, width: 220 },
  halo: { padding: 6, borderRadius: radio.redondo, borderWidth: 3, borderColor: 'transparent' },
  haloActivo: { borderColor: colores.violetaSuave },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: radio.redondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloNodo: { textAlign: 'center' },
  proximo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espacio.s, borderStyle: 'dashed' },
});
