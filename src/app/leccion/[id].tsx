import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Boo } from '@/components/Boo';
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

  useEffect(() => {
    if (!estado.terminada || finalizada.current) return;
    finalizada.current = true;
    terminarLeccion(estado, registrarLeccion);
  }, [estado, registrarLeccion]);

  const item = itemActual(estado);
  if (!item) return null;

  return (
    // La key reinicia la respuesta y el scroll en cada paso.
    <Pantalla key={estado.indice}>
      <View style={estilos.barraSuperior}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Salir de la lección"
          hitSlop={12}
          onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colores.textoSuave} />
        </Pressable>
        <BarraProgreso valor={avance(estado)} />
      </View>

      {esEjercicio(item.paso) ? (
        <PasoEjercicio
          ejercicio={item.paso}
          repaso={item.repaso}
          estado={estado}
          onResponder={(respuesta) => despachar({ tipo: 'responder', respuesta })}
          onPista={() => despachar({ tipo: 'pedir_pista' })}
          onContinuar={() => despachar({ tipo: 'continuar' })}
        />
      ) : (
        <View style={estilos.cuerpo}>
          <View style={estilos.contenido}>
            <TarjetaConcepto paso={item.paso} />
          </View>
          <Boton titulo="Continuar" onPress={() => despachar({ tipo: 'continuar' })} />
        </View>
      )}
    </Pantalla>
  );
}

type PasoEjercicioProps = {
  ejercicio: Ejercicio;
  repaso: boolean;
  estado: EstadoSesion;
  onResponder: (respuesta: Respuesta) => void;
  onPista: () => void;
  onContinuar: () => void;
};

function PasoEjercicio({ ejercicio, repaso, estado, onResponder, onPista, onContinuar }: PasoEjercicioProps) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(
    ejercicio.tipo === 'ordenar' ? [] : null,
  );
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
    if (bien) vibrar.acierto();
    else vibrar.error();
    onResponder(respuesta);
  };

  return (
    <View style={estilos.cuerpo}>
      <View style={estilos.contenido}>
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
      </View>

      {enFeedback ? (
        <PanelFeedback
          correcta={estado.ultimaCorrecta === true}
          fraseBoo={frase}
          explicacion={ejercicio.explicacion}
          respuestaCorrecta={respuestaCorrectaTexto(ejercicio)}
          onContinuar={onContinuar}
        />
      ) : (
        <Boton titulo="Comprobar" deshabilitado={!completa} onPress={comprobar} />
      )}
    </View>
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
