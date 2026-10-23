import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
import { useProgreso } from '@/store/progress';
import { colores, ESPACIO_PESTANAS, espacio } from '@/theme';
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

  // Boo reacciona a la situación (racha, meta); la semilla mantiene fija la frase elegida.
  const [semilla] = useState(Math.random);
  const frase = (lista: string[]) => lista[Math.floor(semilla * lista.length)];
  const boo: { animo: BooAnimo; mensaje: string } = racha.perdida
    ? { animo: 'decepcionada', mensaje: frase(frasesBoo.racha_perdida) }
    : metaCumplida
      ? { animo: 'contenta', mensaje: frase(frasesBoo.meta_cumplida) }
      : { animo: 'feliz', mensaje: frase(frasesBoo.saludo).replace('{nombre}', nombre) };

  const abrir = (id: string) => router.push({ pathname: '/leccion/[id]', params: { id } });

  return (
    <Pantalla bordes={['top']} grilla espacioInferior={ESPACIO_PESTANAS}>
      <View style={estilos.encabezado}>
        <Texto variante="etiqueta" color={colores.primario}>
          booLean.app
        </Texto>
        <Texto variante="titulo">{nombre ? `Hola, ${nombre}` : 'Hola'}</Texto>
      </View>

      <Boo animo={boo.animo} mensaje={boo.mensaje} tamano={64} />

      {/* Tu día, en forma de planilla */}
      <Tarjeta style={estilos.sinRelleno}>
        <View style={estilos.planillaTitulo}>
          <Ionicons name="document-text-outline" size={16} color={colores.textoSuave} />
          <Texto variante="codigo" color={colores.textoSuave}>
            hoy.csv
          </Texto>
        </View>
        <Fila clave="racha" valor={`${racha.actual} ${racha.actual === 1 ? 'día' : 'días'}`} icono="flame" color={colores.racha} />
        <Fila clave="xp_total" valor={String(progreso.xpTotal)} icono="star" color={colores.xp} />
        <Fila clave="xp_hoy" valor={`${xpHoy} / ${metaXp}`} icono="flag" color={colores.violeta} />
        <Fila
          clave="meta_cumplida"
          valor={metaCumplida ? 'VERDADERO' : 'FALSO'}
          icono={metaCumplida ? 'checkmark-circle' : 'ellipse-outline'}
          color={metaCumplida ? colores.primario : colores.rosa}
          resaltar
          ultima
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
        <GraficoSemana dias={ultimosDias(progreso, hoy)} hoy={hoy} meta={metaXp} />
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

type FilaProps = {
  clave: string;
  valor: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  resaltar?: boolean;
  ultima?: boolean;
};

/** Una fila de la planilla "hoy.csv": nombre de la variable y su valor. */
function Fila({ clave, valor, icono, color, resaltar, ultima }: FilaProps) {
  return (
    <View style={[estilos.fila, !ultima && estilos.filaBorde]}>
      <View style={estilos.celdaClave}>
        <Ionicons name={icono} size={16} color={color} />
        <Texto variante="codigo" color={colores.textoSuave}>
          {clave}
        </Texto>
      </View>
      <View style={estilos.celdaValor}>
        <Texto variante="numero" style={estilos.valor} color={resaltar ? color : colores.texto}>
          {valor}
        </Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  encabezado: { gap: espacio.xs, marginTop: espacio.s },
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
