import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { Llama } from '@/components/animaciones/Llama';
import { LluviaBooleanos } from '@/components/animaciones/LluviaBooleanos';
import { useTemblor } from '@/components/animaciones/useTemblor';
import { Boo, type Mirada } from '@/components/Boo';
import { Completar } from '@/components/exercises/Completar';
import { OpcionMultiple } from '@/components/exercises/OpcionMultiple';
import { Ordenar } from '@/components/exercises/Ordenar';
import { PanelFeedback } from '@/components/PanelFeedback';
import { TablaDatos } from '@/components/TablaDatos';
import { TarjetaConcepto } from '@/components/TarjetaConcepto';
import { BarraProgreso } from '@/components/ui/BarraProgreso';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { Texto } from '@/components/ui/Texto';
import { frasesBoo, obtenerLeccion } from '@/content';
import { respuestaCorrectaTexto } from '@/engine/grading';
import { META_XP, xpDeHoy } from '@/engine/progreso';
import {
  avance,
  calcularResultado,
  iniciarSesion,
  itemActual,
  reducirSesion,
  XP_COSTO_PISTA,
  type EstadoSesion,
} from '@/engine/session';
import { claveDia, rachaVigente } from '@/engine/streak';
import { vibrar } from '@/lib/haptics';
import { elegir } from '@/lib/random';
import { sonar } from '@/lib/sonidos';
import { useProgreso } from '@/store/progress';
import { colores, espacio } from '@/theme';
import { esEjercicio, type Ejercicio, type Leccion, type Respuesta } from '@/types/content';

export default function PantallaLeccion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const leccion = obtenerLeccion(id);

  if (!leccion) {
    return (
      <Pantalla pie={<Boton titulo="Volver" onPress={() => router.back()} />}>
        <Boo animo="sorprendida" mensaje="Uy, no encontré esa lección." />
      </Pantalla>
    );
  }
  return <Sesion leccion={leccion} />;
}

function Sesion({ leccion }: { leccion: Leccion }) {
  const [estado, despachar] = useReducer(reducirSesion, leccion, iniciarSesion);
  const registrarLeccion = useProgreso((s) => s.registrarLeccion);
  const finalizada = useRef(false);
  const [lluvia, setLluvia] = useState(0);
  const [mirada, setMirada] = useState<Mirada | undefined>();
  const [sorpresa, setSorpresa] = useState(false);

  useEffect(() => {
    if (!estado.terminada || finalizada.current) return;
    finalizada.current = true;
    terminarLeccion(estado, registrarLeccion);
  }, [estado, registrarLeccion]);

  // Después de un error, Boo se sorprende un instante y después se pone triste.
  useEffect(() => {
    if (!sorpresa) return;
    const t = setTimeout(() => setSorpresa(false), 600);
    return () => clearTimeout(t);
  }, [sorpresa]);

  const item = itemActual(estado);
  if (!item) return null;

  const enLlamas = estado.combo >= 5;
  const animoBoo =
    estado.fase === 'feedback'
      ? estado.ultimaCorrecta
        ? 'contenta'
        : sorpresa
          ? 'sorprendida'
          : 'triste'
      : esEjercicio(item.paso)
        ? 'pensando'
        : 'feliz';

  const continuar = () => {
    setMirada(undefined);
    despachar({ tipo: 'continuar' });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* La key reinicia la respuesta y el scroll en cada paso. */}
      <Pantalla key={estado.indice}>
        <View style={estilos.barraSuperior}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Salir de la lección"
            hitSlop={12}
            onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colores.textoSuave} />
          </Pressable>
          <BarraProgreso valor={avance(estado)} color={enLlamas ? colores.racha : colores.primario} />
          {enLlamas ? <Llama racha={estado.combo * 2} tamano={18} /> : null}
          <Boo
            animo={animoBoo}
            tamano={34}
            mirar={mirada}
            anteojos={estado.combo >= 3}
          />
        </View>

        <Animated.View entering={FadeInRight.duration(280)} style={estilos.cuerpo}>
          {esEjercicio(item.paso) ? (
            <PasoEjercicio
              ejercicio={item.paso}
              repaso={item.repaso}
              estado={estado}
              onMirar={setMirada}
              onResponder={(respuesta) => {
                const siguiente = reducirSesion(estado, { tipo: 'responder', respuesta });
                if (siguiente.ultimaCorrecta) {
                  setLluvia((n) => n + 1);
                  if (siguiente.combo === 3 || siguiente.combo === 5) setTimeout(() => sonar('combo'), 350);
                } else {
                  setSorpresa(true);
                }
                despachar({ tipo: 'responder', respuesta });
              }}
              onPista={() => despachar({ tipo: 'pedir_pista' })}
              onContinuar={continuar}
            />
          ) : (
            <>
              <View style={estilos.contenido}>
                <TarjetaConcepto paso={item.paso} />
              </View>
              <Boton titulo="Continuar" onPress={continuar} />
            </>
          )}
        </Animated.View>
      </Pantalla>
      <LluviaBooleanos disparo={lluvia} />
    </View>
  );
}

/** Hacia dónde mira Boo (arriba a la derecha) según lo que elegiste. */
function miradaHacia(ejercicio: Ejercicio, respuesta: Respuesta | null): Mirada | undefined {
  if (respuesta === null || (Array.isArray(respuesta) && respuesta.length === 0)) return undefined;
  if (ejercicio.tipo === 'opcion_multiple' && typeof respuesta === 'string') {
    const i = ejercicio.opciones.findIndex((o) => o.id === respuesta);
    const n = Math.max(1, ejercicio.opciones.length - 1);
    return { x: -0.6, y: 0.2 + 0.8 * (i / n) };
  }
  if (ejercicio.tipo === 'ordenar' && Array.isArray(respuesta)) {
    return { x: -0.7, y: Math.min(1, 0.2 + respuesta.length * 0.25) };
  }
  return { x: -0.8, y: 1 };
}

type PasoEjercicioProps = {
  ejercicio: Ejercicio;
  repaso: boolean;
  estado: EstadoSesion;
  onMirar: (mirada: Mirada | undefined) => void;
  onResponder: (respuesta: Respuesta) => void;
  onPista: () => void;
  onContinuar: () => void;
};

function PasoEjercicio({ ejercicio, repaso, estado, onMirar, onResponder, onPista, onContinuar }: PasoEjercicioProps) {
  const [respuesta, setRespuestaInterna] = useState<Respuesta | null>(
    ejercicio.tipo === 'ordenar' ? [] : null,
  );
  const setRespuesta = (r: Respuesta) => {
    setRespuestaInterna(r);
    onMirar(miradaHacia(ejercicio, r));
  };
  const { estilo: temblor, temblar } = useTemblor();
  const [frase, setFrase] = useState('');
  const enFeedback = estado.fase === 'feedback';
  const pistaUsada = estado.pistas.includes(ejercicio.id);

  const completa =
    ejercicio.tipo === 'ordenar'
      ? Array.isArray(respuesta) && respuesta.length === ejercicio.items.length
      : typeof respuesta === 'string' && respuesta.trim().length > 0;

  const comprobar = () => {
    if (respuesta === null) return;
    const siguiente = reducirSesion(estado, { tipo: 'responder', respuesta });
    const bien = siguiente.ultimaCorrecta === true;
    setFrase(elegir(bien ? frasesBoo.acierto : frasesBoo.error));
    if (bien) {
      vibrar.acierto();
      sonar('acierto');
    } else {
      vibrar.error();
      sonar('error');
      temblar();
    }
    onResponder(respuesta);
  };

  return (
    <>
      <Animated.View style={[estilos.contenido, temblor]}>
        <Texto variante="etiqueta" color={repaso ? colores.racha : colores.violeta}>
          {repaso ? '🔁 Repaso: esto te costó' : 'Práctica'}
        </Texto>
        <Texto variante="subtitulo">{ejercicio.consigna}</Texto>
        {ejercicio.tabla ? <TablaDatos tabla={ejercicio.tabla} /> : null}

        {ejercicio.tipo === 'opcion_multiple' ? (
          <OpcionMultiple
            ejercicio={ejercicio}
            respuesta={typeof respuesta === 'string' ? respuesta : null}
            onCambiar={setRespuesta}
            bloqueado={enFeedback}
          />
        ) : ejercicio.tipo === 'completar' ? (
          <Completar
            ejercicio={ejercicio}
            respuesta={typeof respuesta === 'string' ? respuesta : null}
            onCambiar={setRespuesta}
            bloqueado={enFeedback}
          />
        ) : (
          <Ordenar
            ejercicio={ejercicio}
            respuesta={Array.isArray(respuesta) ? respuesta : []}
            onCambiar={setRespuesta}
            bloqueado={enFeedback}
          />
        )}

        {ejercicio.pista && !enFeedback ? (
          pistaUsada ? (
            <Boo animo="pensando" tamano={48} mensaje={`${elegirPista(ejercicio.id)} ${ejercicio.pista}`} />
          ) : (
            <Boton
              titulo={`💡 Pista de Boo (−${XP_COSTO_PISTA} XP)`}
              variante="fantasma"
              onPress={onPista}
            />
          )
        ) : null}
      </Animated.View>

      {enFeedback ? (
        <PanelFeedback
          correcta={estado.ultimaCorrecta === true}
          combo={estado.combo}
          fraseBoo={frase}
          explicacion={ejercicio.explicacion}
          respuestaCorrecta={respuestaCorrectaTexto(ejercicio)}
          onContinuar={onContinuar}
        />
      ) : (
        <Boton titulo="Comprobar" deshabilitado={!completa} onPress={comprobar} />
      )}
    </>
  );
}

/** Frase de introducción de la pista, fija por ejercicio para que no cambie al re-renderizar. */
function elegirPista(id: string): string {
  const suma = [...id].reduce((total, c) => total + c.charCodeAt(0), 0);
  return frasesBoo.pista[suma % frasesBoo.pista.length];
}

function terminarLeccion(
  estado: EstadoSesion,
  registrarLeccion: (r: ReturnType<typeof calcularResultado>) => void,
) {
  const resultado = calcularResultado(estado);
  const hoy = claveDia();
  const antes = useProgreso.getState();
  const metaXp = antes.perfil ? META_XP[antes.perfil.metaMinutos] : META_XP[10];
  const rachaAntes = rachaVigente(antes.racha, hoy).actual;
  const metaAntes = xpDeHoy(antes, hoy) >= metaXp;

  registrarLeccion(resultado);
  sonar('terminar');

  const despues = useProgreso.getState();
  const rachaDespues = rachaVigente(despues.racha, hoy).actual;
  const metaDespues = xpDeHoy(despues, hoy) >= metaXp;

  router.replace({
    pathname: '/resultado',
    params: {
      leccion: resultado.leccionId,
      pistas: String(resultado.pistas),
      xp: String(resultado.xp),
      aciertos: String(resultado.aciertos),
      total: String(resultado.total),
      perfecta: resultado.perfecta ? '1' : '0',
      racha: String(rachaDespues),
      rachaAntes: String(rachaAntes),
      mejorCombo: String(estado.mejorCombo),
      rachaSubio: rachaDespues > rachaAntes ? '1' : '0',
      metaCumplida: !metaAntes && metaDespues ? '1' : '0',
    },
  });
}

const estilos = StyleSheet.create({
  barraSuperior: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  cuerpo: { flex: 1, gap: espacio.m, justifyContent: 'space-between' },
  contenido: { gap: espacio.m },
});
