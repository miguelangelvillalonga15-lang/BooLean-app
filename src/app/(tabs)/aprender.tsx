import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BooDibujo } from '@/components/Boo';
import { Pantalla } from '@/components/ui/Pantalla';
import { Tarjeta } from '@/components/ui/Tarjeta';
import { Texto } from '@/components/ui/Texto';
import { curso, obtenerLeccion } from '@/content';
import { estadoLeccion, type EstadoLeccion } from '@/engine/progreso';
import { useProgreso } from '@/store/progress';
import { colores, ESPACIO_PESTANAS, espacio, radio } from '@/theme';

// Cada lección se corre a un costado para que el camino haga zigzag.
const DESPLAZAMIENTOS = [0, 1, 0, -1];
const PASO_X = 64;

/** Camino de lecciones: Boo deja huellitas entre una y otra. */
export default function Aprender() {
  const progreso = useProgreso();
  const abrir = (id: string) => router.push({ pathname: '/leccion/[id]', params: { id } });

  return (
    <Pantalla bordes={['top']} grilla espacioInferior={ESPACIO_PESTANAS}>
      <Texto variante="titulo">Tu camino</Texto>

      {curso.unidades.map((unidad, u) => {
        const hechas = unidad.lecciones.filter((id) => progreso.lecciones[id]?.completada).length;
        return (
          <View key={unidad.id} style={estilos.unidad}>
            <Tarjeta style={estilos.cabecera}>
              <View style={{ flex: 1, gap: espacio.xs }}>
                <Texto variante="etiqueta" color={colores.violeta}>
                  Unidad {String(u + 1).padStart(2, '0')} ·{' '}
                  {curso.niveles.find((n) => n.id === unidad.nivel)?.titulo}
                </Texto>
                <Texto variante="subtitulo">{unidad.titulo}</Texto>
                <Texto variante="codigo" color={colores.textoSuave}>
                  {hechas}/{unidad.lecciones.length} lecciones
                </Texto>
              </View>
              <BooDibujo animo={hechas === unidad.lecciones.length ? 'contenta' : 'feliz'} tamano={76} />
            </Tarjeta>

            {unidad.lecciones.map((id, i) => {
              const leccion = obtenerLeccion(id);
              const estado = estadoLeccion(curso, progreso, id);
              const desde = DESPLAZAMIENTOS[i % 4];
              const hasta = DESPLAZAMIENTOS[(i + 1) % 4];
              return (
                <View key={id} style={estilos.tramo}>
                  <NodoLeccion
                    numero={i + 1}
                    titulo={leccion?.titulo ?? id}
                    minutos={leccion?.minutos ?? 0}
                    estado={estado}
                    desplazamiento={desde}
                    onPress={() => abrir(id)}
                  />
                  {i < unidad.lecciones.length - 1 ? (
                    <Huellitas desde={desde} hasta={hasta} pisadas={estado === 'completada'} />
                  ) : null}
                </View>
              );
            })}
          </View>
        );
      })}

      <Tarjeta style={estilos.proximo}>
        <Ionicons name="lock-closed" size={18} color={colores.textoSuave} />
        <Texto variante="codigo" color={colores.textoSuave}>
          Unidad 02 · Excel desde cero
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}

/** Tres huellitas en diagonal que unen una lección con la siguiente. */
function Huellitas({ desde, hasta, pisadas }: { desde: number; hasta: number; pisadas: boolean }) {
  return (
    <View style={estilos.huellitas} accessible={false}>
      {[0.25, 0.5, 0.75].map((t, k) => {
        const x = (desde + (hasta - desde) * t) * PASO_X + (k % 2 === 0 ? -8 : 8);
        return (
          <Ionicons
            key={t}
            name="paw"
            size={16}
            color={pisadas ? colores.primario : colores.bloqueado}
            style={{ transform: [{ translateX: x }, { rotate: `${(hasta - desde) * -25}deg` }] }}
          />
        );
      })}
    </View>
  );
}

type NodoProps = {
  numero: number;
  titulo: string;
  minutos: number;
  estado: EstadoLeccion;
  desplazamiento: number;
  onPress: () => void;
};

function NodoLeccion({ numero, titulo, minutos, estado, desplazamiento, onPress }: NodoProps) {
  const bloqueada = estado === 'bloqueada';
  const actual = estado === 'disponible';
  const icono = estado === 'completada' ? 'checkmark' : bloqueada ? 'lock-closed' : 'play';
  const fondo =
    estado === 'completada' ? colores.primario : actual ? colores.violeta : colores.superficieAlta;
  const colorIcono =
    estado === 'completada' ? colores.textoSobrePrimario : bloqueada ? colores.textoSuave : colores.fondo;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lección ${numero}: ${titulo}. ${
        estado === 'completada' ? 'Completada' : bloqueada ? 'Bloqueada' : 'Disponible'
      }`}
      accessibilityState={{ disabled: bloqueada }}
      disabled={bloqueada}
      onPress={onPress}
      style={[estilos.nodo, { transform: [{ translateX: desplazamiento * PASO_X }] }]}>
      {({ pressed }) => (
        <>
          <View style={[estilos.halo, actual && estilos.haloActivo]}>
            <View
              style={[
                estilos.circulo,
                { backgroundColor: fondo, transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}>
              <Ionicons name={icono} size={28} color={colorIcono} />
            </View>
            <View style={estilos.numero}>
              <Texto variante="etiqueta" color={colores.texto}>
                L{numero}
              </Texto>
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
              ▶ empezar · {minutos} min
            </Texto>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  unidad: { gap: espacio.m, alignItems: 'center' },
  cabecera: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', padding: espacio.m },
  tramo: { alignItems: 'center' },
  nodo: { alignItems: 'center', gap: espacio.xs, width: 220 },
  halo: { padding: 6, borderRadius: radio.redondo, borderWidth: 3, borderColor: 'transparent' },
  haloActivo: { borderColor: colores.violetaSuave },
  circulo: {
    width: 70,
    height: 70,
    borderRadius: radio.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: colores.fondo,
    borderColor: colores.borde,
    borderWidth: 1,
    borderRadius: radio.redondo,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tituloNodo: { textAlign: 'center' },
  huellitas: { height: 72, justifyContent: 'space-around', alignItems: 'center', paddingVertical: espacio.xs },
  proximo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio.s,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
});
