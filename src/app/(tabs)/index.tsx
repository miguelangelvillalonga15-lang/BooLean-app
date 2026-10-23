import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BooDibujo } from '@/components/Boo';
import { AnilloProgreso } from '@/components/ui/AnilloProgreso';
import { BarraProgreso } from '@/components/ui/BarraProgreso';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { IconoCirculo, Tarjeta } from '@/components/ui/Tarjeta';
import { Texto } from '@/components/ui/Texto';
import { curso, frasesBoo, glosario, obtenerLeccion } from '@/content';
import { META_XP, siguienteLeccion, xpDeHoy } from '@/engine/progreso';
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
  const nombre = progreso.perfil?.nombre ?? '';

  // Unidad que se está cursando (o la última, si ya terminó todo).
  const unidad =
    curso.unidades.find((u) => siguiente && u.lecciones.includes(siguiente)) ??
    curso.unidades[curso.unidades.length - 1];
  const hechas = unidad.lecciones.filter((id) => progreso.lecciones[id]?.completada).length;
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
    <Pantalla bordes={['top']}>
      <View style={estilos.fila}>
        <Tarjeta style={estilos.contador} accessibilityLabel={`Racha de ${racha.actual} días`}>
          <Ionicons name="flame" size={24} color={racha.actual > 0 ? colores.racha : colores.bloqueado} />
          <Texto variante="numero">{racha.actual}</Texto>
        </Tarjeta>
        <Tarjeta style={estilos.contador} accessibilityLabel={`${progreso.xpTotal} XP`}>
          <Ionicons name="star" size={22} color={colores.xp} />
          <Texto variante="numero">{progreso.xpTotal}</Texto>
        </Tarjeta>
      </View>

      <LinearGradient
        colors={[colores.superficie, colores.violetaOscuro, colores.violeta]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={estilos.banner}>
        <View style={estilos.bannerTexto}>
          <Texto variante="etiqueta" color={colores.textoSuave}>
            {nombre ? `Hola, ${nombre}` : 'Hola'}
          </Texto>
          <Texto variante="subtitulo">{boo.mensaje}</Texto>
        </View>
        <BooDibujo animo={boo.animo} tamano={96} />
      </LinearGradient>

      <Tarjeta style={estilos.unidad}>
        <Texto variante="etiqueta" color={colores.primario}>
          Unidad {curso.unidades.indexOf(unidad) + 1} ·{' '}
          {curso.niveles.find((n) => n.id === unidad.nivel)?.titulo}
        </Texto>
        <Texto variante="titulo">{unidad.titulo}</Texto>
        <Texto variante="chico" color={colores.textoSuave}>
          {unidad.descripcion}
        </Texto>
        <View style={estilos.anillo}>
          <AnilloProgreso valor={hechas / unidad.lecciones.length} />
        </View>
        {siguiente ? (
          <>
            <Texto variante="chico" color={colores.textoSuave} style={estilos.centrado}>
              Próxima: {obtenerLeccion(siguiente)?.titulo}
            </Texto>
            <Boton titulo={hechas === 0 ? 'Empezar' : 'Seguir aprendiendo'} onPress={() => abrir(siguiente)} />
          </>
        ) : (
          <Texto variante="chico" color={colores.primario} style={estilos.centrado}>
            ¡Terminaste la unidad! Pronto llegan más lecciones.
          </Texto>
        )}
      </Tarjeta>

      <View style={estilos.fila}>
        <Tarjeta style={estilos.mitad}>
          <IconoCirculo nombre="flag" color={colores.racha} />
          <Texto variante="subtitulo" style={estilos.tituloTarjeta}>
            Meta de hoy
          </Texto>
          <Texto variante="chico" color={metaCumplida ? colores.primario : colores.textoSuave}>
            {Math.min(xpHoy, metaXp)} / {metaXp} XP {metaCumplida ? '✓' : ''}
          </Texto>
          <BarraProgreso valor={xpHoy / metaXp} color={colores.racha} alto={8} />
        </Tarjeta>
        <Tarjeta style={estilos.mitad} onPress={() => router.push('/glosario')} accessibilityLabel="Abrir glosario">
          <IconoCirculo nombre="book" color={colores.violeta} />
          <Texto variante="subtitulo" style={estilos.tituloTarjeta}>
            Glosario
          </Texto>
          <Texto variante="chico" color={colores.textoSuave}>
            {palabras} de {glosario.length} palabras
          </Texto>
        </Tarjeta>
      </View>

      <Tarjeta style={estilos.proximo}>
        <IconoCirculo nombre="grid" color={colores.azul} />
        <View style={{ flex: 1 }}>
          <Texto variante="subtitulo">Excel desde cero</Texto>
          <Texto variante="chico" color={colores.textoSuave}>
            Próximamente: Unidad 2
          </Texto>
        </View>
        <Ionicons name="lock-closed" size={20} color={colores.textoSuave} />
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: espacio.m },
  contador: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espacio.s + 4,
    borderRadius: radio.m,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.s,
    borderRadius: radio.l,
    padding: espacio.m,
    paddingRight: espacio.s,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  bannerTexto: { flex: 1, gap: espacio.xs },
  unidad: { padding: espacio.l, gap: espacio.s },
  anillo: { alignItems: 'center', paddingVertical: espacio.m },
  centrado: { textAlign: 'center' },
  mitad: { flex: 1, padding: espacio.m + 4, gap: espacio.s },
  tituloTarjeta: { marginTop: espacio.l },
  proximo: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, padding: espacio.m + 4 },
});
