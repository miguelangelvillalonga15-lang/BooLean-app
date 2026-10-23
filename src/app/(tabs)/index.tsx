import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Llama } from '@/components/animaciones/Llama';
import { TextoTipeado } from '@/components/animaciones/TextoTipeado';
import { Boo } from '@/components/Boo';
import { GraficoLecciones } from '@/components/graficos/GraficoLecciones';
import { GraficoSemana } from '@/components/graficos/GraficoSemana';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { IconoCirculo, Tarjeta } from '@/components/ui/Tarjeta';
import { Texto } from '@/components/ui/Texto';
import { curso, frasesBoo, glosario, obtenerLeccion } from '@/content';
import { estadoLeccion, META_XP, siguienteLeccion, ultimosDias, xpDeHoy } from '@/engine/progreso';
import { claveDia, rachaVigente } from '@/engine/streak';
import { vibrar } from '@/lib/haptics';
import { sonar } from '@/lib/sonidos';
import { useProgreso } from '@/store/progress';
import { colores, ESPACIO_PESTANAS, espacio, fuentes, radio } from '@/theme';
import type { BooAnimo } from '@/types/content';

export default function Inicio() {
  const progreso = useProgreso();
  const hoy = claveDia();
  const racha = rachaVigente(progreso.racha, hoy);
  const metaXp = progreso.perfil ? META_XP[progreso.perfil.metaMinutos] : META_XP[10];
  const xpHoy = xpDeHoy(progreso, hoy);
  const metaCumplida = xpHoy >= metaXp;
  const siguiente = siguienteLeccion(curso, progreso);
  const nombre = progreso.perfil?.nombre ?? '';

  // Unidad que se está cursando (o la última, si ya terminó todo).
  const unidad =
    curso.unidades.find((u) => siguiente && u.lecciones.includes(siguiente)) ??
    curso.unidades[curso.unidades.length - 1];
  const numeroUnidad = curso.unidades.indexOf(unidad) + 1;
  const palabras = glosario.filter((t) => progreso.lecciones[t.leccion]?.completada).length;

  // Cada vez que volvés al inicio, los gráficos crecen de nuevo.
  const [visita, setVisita] = useState(0);
  useFocusEffect(useCallback(() => setVisita((v) => v + 1), []));

  // Festejo de la meta: la celda pasa de FALSO a VERDADERO tipeando, una vez por día.
  const tipearMeta = metaCumplida && progreso.metaCelebrada !== hoy && visita > 0;
  const [destello, setDestello] = useState(false);

  // Boo reacciona a la situación; la semilla mantiene fija la frase elegida.
  const [semilla] = useState(Math.random);
  const frase = (lista: string[]) => lista[Math.floor(semilla * lista.length)];
  const [reaccion, setReaccion] = useState<{ animo: BooAnimo; mensaje?: string } | null>(null);
  const [purrs, setPurrs] = useState(0);
  const dormida = xpHoy === 0 && !racha.perdida;

  const boo: { animo: BooAnimo; mensaje: string } = racha.perdida
    ? { animo: 'decepcionada', mensaje: frase(frasesBoo.racha_perdida) }
    : metaCumplida
      ? { animo: 'contenta', mensaje: frase(frasesBoo.meta_cumplida) }
      : dormida
        ? { animo: 'dormida', mensaje: frase(frasesBoo.dormida) }
        : { animo: 'feliz', mensaje: frase(frasesBoo.saludo).replace('{nombre}', nombre) };

  useEffect(() => {
    if (!reaccion) return;
    const t = setTimeout(() => setReaccion(null), 1800);
    return () => clearTimeout(t);
  }, [reaccion]);

  const mimar = () => {
    sonar('ronroneo');
    vibrar.ronroneo();
    setPurrs((n) => n + 1);
    setReaccion({ animo: 'enamorada', mensaje: frasesBoo.mimos[purrs % frasesBoo.mimos.length] });
  };

  const abrir = (id: string) => {
    if (dormida) {
      // Boo se despierta de un salto antes de arrancar.
      sonar('miau');
      vibrar.suave();
      setReaccion({ animo: 'sorprendida', mensaje: '¡Miau! ¡Estoy despierta!' });
      setTimeout(() => router.push({ pathname: '/leccion/[id]', params: { id } }), 550);
    } else {
      router.push({ pathname: '/leccion/[id]', params: { id } });
    }
  };

  return (
    <Pantalla bordes={['top']} grilla espacioInferior={ESPACIO_PESTANAS}>
      <View style={estilos.encabezado}>
        <View style={{ flex: 1, gap: espacio.xs }}>
          <Texto variante="etiqueta" color={colores.primario}>
            booLean.app
          </Texto>
          <Texto variante="titulo">{nombre ? `Hola, ${nombre}` : 'Hola'}</Texto>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: progreso.sonido }}
          accessibilityLabel="Sonido"
          hitSlop={10}
          onPress={() => {
            progreso.alternarSonido();
            vibrar.toque();
          }}
          style={estilos.botonSonido}>
          <Ionicons
            name={progreso.sonido ? 'volume-high' : 'volume-mute'}
            size={20}
            color={progreso.sonido ? colores.texto : colores.textoSuave}
          />
        </Pressable>
      </View>

      <View>
        <Boo
          animo={reaccion?.animo ?? boo.animo}
          mensaje={reaccion?.mensaje ?? boo.mensaje}
          tamano={64}
          alTocar={mimar}
        />
        {purrs > 0 ? <Purr key={purrs} /> : null}
      </View>

      {/* Tu día, en forma de planilla */}
      <Tarjeta style={estilos.sinRelleno}>
        <View style={estilos.planillaTitulo}>
          <Ionicons name="document-text-outline" size={16} color={colores.textoSuave} />
          <Texto variante="codigo" color={colores.textoSuave}>
            hoy.csv
          </Texto>
        </View>
        <Fila
          clave="racha"
          icono={<Llama racha={racha.actual} tamano={16} />}
          valor={<Valor>{`${racha.actual} ${racha.actual === 1 ? 'día' : 'días'}`}</Valor>}
        />
        <Fila clave="xp_total" icono={<Ionicons name="star" size={16} color={colores.xp} />} valor={<Valor>{progreso.xpTotal}</Valor>} />
        <Fila
          clave="xp_hoy"
          icono={<Ionicons name="flag" size={16} color={colores.violeta} />}
          valor={<Valor>{`${xpHoy} / ${metaXp}`}</Valor>}
        />
        <Fila
          clave="meta_cumplida"
          icono={
            <Ionicons
              name={metaCumplida ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={metaCumplida ? colores.primario : colores.rosa}
            />
          }
          destello={destello}
          ultima
          valor={
            tipearMeta ? (
              <TextoTipeado
                key={visita}
                de="FALSO"
                a="VERDADERO"
                retraso={700}
                variante="numero"
                color={colores.primario}
                style={estilos.valor}
                alTipear={() => sonar('clic')}
                alTerminar={() => {
                  sonar('combo');
                  vibrar.acierto();
                  setDestello(true);
                  setTimeout(() => setDestello(false), 900);
                  progreso.marcarMetaCelebrada(hoy);
                }}
              />
            ) : (
              <Valor color={metaCumplida ? colores.primario : colores.rosa}>
                {metaCumplida ? 'VERDADERO' : 'FALSO'}
              </Valor>
            )
          }
        />
      </Tarjeta>

      {/* Unidad actual con el puntaje de cada lección */}
      <Tarjeta style={estilos.unidad}>
        <Texto variante="etiqueta" color={colores.violeta}>
          Unidad {String(numeroUnidad).padStart(2, '0')} ·{' '}
          {curso.niveles.find((n) => n.id === unidad.nivel)?.titulo}
        </Texto>
        <Texto variante="titulo">{unidad.titulo}</Texto>
        <View style={estilos.grafico}>
          <GraficoLecciones
            key={visita}
            barras={unidad.lecciones.map((id) => ({
              id,
              estado: estadoLeccion(curso, progreso, id),
              puntaje: progreso.lecciones[id]?.mejorPuntaje ?? 0,
            }))}
          />
        </View>
        {siguiente ? (
          <>
            <Texto variante="chico" color={colores.textoSuave}>
              Próxima: <Texto variante="chico">{obtenerLeccion(siguiente)?.titulo}</Texto>
            </Texto>
            <Boton
              titulo={progreso.lecciones[unidad.lecciones[0]]?.completada ? 'Seguir aprendiendo' : 'Empezar'}
              onPress={() => abrir(siguiente)}
            />
          </>
        ) : (
          <Texto variante="chico" color={colores.primario}>
            ¡Terminaste la unidad! Pronto llegan más lecciones.
          </Texto>
        )}
      </Tarjeta>

      <Tarjeta style={estilos.semana}>
        <View style={estilos.filaEntre}>
          <Texto variante="subtitulo">Tu semana</Texto>
          <Texto variante="codigo" color={colores.racha}>
            - - meta {metaXp} XP
          </Texto>
        </View>
        <GraficoSemana key={visita} dias={ultimosDias(progreso, hoy)} hoy={hoy} meta={metaXp} />
      </Tarjeta>

      <View style={estilos.filaTarjetas}>
        <Tarjeta style={estilos.mitad} onPress={() => router.push('/glosario')} accessibilityLabel="Abrir glosario">
          <IconoCirculo nombre="book" color={colores.violeta} tamano={44} />
          <Texto variante="subtitulo" style={estilos.tituloMitad}>
            Glosario
          </Texto>
          <Texto variante="codigo" color={colores.textoSuave}>
            {palabras}/{glosario.length} palabras
          </Texto>
        </Tarjeta>
        <Tarjeta style={[estilos.mitad, estilos.punteada]}>
          <IconoCirculo nombre="grid" color={colores.azul} tamano={44} />
          <Texto variante="subtitulo" style={estilos.tituloMitad}>
            Excel
          </Texto>
          <Texto variante="codigo" color={colores.textoSuave}>
            próximamente
          </Texto>
        </Tarjeta>
      </View>
    </Pantalla>
  );
}

/** "purr~" que sube y se desvanece cuando le hacés mimos a Boo. */
function Purr() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) });
  }, [t]);
  const estilo = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateY: -40 * t.value }, { rotate: `${-10 + t.value * 20}deg` }],
  }));
  return (
    <Animated.Text pointerEvents="none" style={[estilos.purr, estilo]}>
      purr~ 💕
    </Animated.Text>
  );
}

function Valor({ children, color = colores.texto }: { children: ReactNode; color?: string }) {
  return (
    <Texto variante="numero" style={estilos.valor} color={color}>
      {children}
    </Texto>
  );
}

type FilaProps = {
  clave: string;
  icono: ReactNode;
  valor: ReactNode;
  destello?: boolean;
  ultima?: boolean;
};

/** Una fila de la planilla "hoy.csv": nombre de la variable y su valor. */
function Fila({ clave, icono, valor, destello, ultima }: FilaProps) {
  return (
    <View style={[estilos.fila, !ultima && estilos.filaBorde, destello && estilos.destello]}>
      <View style={estilos.celdaClave}>
        <View style={estilos.icono}>{icono}</View>
        <Texto variante="codigo" color={colores.textoSuave}>
          {clave}
        </Texto>
      </View>
      <View style={estilos.celdaValor}>{valor}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  encabezado: { flexDirection: 'row', alignItems: 'center', marginTop: espacio.s },
  botonSonido: {
    width: 40,
    height: 40,
    borderRadius: radio.redondo,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purr: {
    position: 'absolute',
    left: 20,
    top: -6,
    color: colores.rosa,
    fontFamily: fuentes.monoNegrita,
    fontSize: 15,
  },
  sinRelleno: { padding: 0, gap: 0, overflow: 'hidden' },
  planillaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    paddingHorizontal: espacio.m,
    paddingVertical: espacio.s + 2,
    backgroundColor: colores.superficieAlta,
    borderBottomWidth: 1,
    borderColor: colores.borde,
  },
  fila: { flexDirection: 'row', alignItems: 'stretch' },
  filaBorde: { borderBottomWidth: 1, borderColor: colores.borde },
  destello: { backgroundColor: colores.primarioSuave },
  celdaClave: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    paddingHorizontal: espacio.m,
    paddingVertical: espacio.s + 4,
    borderRightWidth: 1,
    borderColor: colores.borde,
  },
  icono: { width: 20, alignItems: 'center' },
  celdaValor: { flex: 1, justifyContent: 'center', paddingHorizontal: espacio.m },
  valor: { fontSize: 17, textAlign: 'right' },
  unidad: { padding: espacio.l, gap: espacio.s },
  grafico: { paddingVertical: espacio.m },
  semana: { padding: espacio.l, gap: espacio.m },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filaTarjetas: { flexDirection: 'row', gap: espacio.m },
  mitad: { flex: 1, padding: espacio.m + 4, gap: espacio.xs },
  tituloMitad: { marginTop: espacio.m },
  punteada: { borderStyle: 'dashed', backgroundColor: 'transparent' },
});
