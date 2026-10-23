import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Boo } from '@/components/Boo';
import { Pantalla } from '@/components/ui/Pantalla';
import { Tarjeta } from '@/components/ui/Tarjeta';
import { Texto } from '@/components/ui/Texto';
import { glosario, obtenerLeccion } from '@/content';
import { useProgreso } from '@/store/progress';
import { colores, ESPACIO_PESTANAS, espacio, radio } from '@/theme';

/** Términos aprendidos. Cada término se desbloquea al completar su lección. */
export default function Glosario() {
  const lecciones = useProgreso((s) => s.lecciones);
  const desbloqueados = glosario.filter((t) => lecciones[t.leccion]?.completada).length;

  return (
    <Pantalla bordes={['top']} espacioInferior={ESPACIO_PESTANAS}>
      <Texto variante="titulo">Glosario</Texto>
      <Boo
        animo={desbloqueados > 0 ? 'contenta' : 'pensando'}
        tamano={48}
        mensaje={
          desbloqueados > 0
            ? `Ya aprendiste ${desbloqueados} de ${glosario.length} palabras. ¡Vas re bien!`
            : 'Acá van a aparecer las palabras que aprendas en cada lección.'
        }
      />
      {glosario.map((t) => {
        const abierto = lecciones[t.leccion]?.completada;
        return (
          <Tarjeta key={t.termino} style={!abierto && estilos.bloqueada}>
            <View style={estilos.encabezado}>
              <Texto variante="subtitulo" color={abierto ? colores.primario : colores.textoSuave}>
                {t.termino}
              </Texto>
              {abierto ? (
                <View style={estilos.chip}>
                  <Texto variante="etiqueta" color={colores.textoSuave}>
                    {t.leccion.replace('u', 'U').replace('-l', '·L')}
                  </Texto>
                </View>
              ) : (
                <Ionicons name="lock-closed" size={18} color={colores.textoSuave} />
              )}
            </View>
            {abierto ? (
              <>
                <Texto>{t.definicion}</Texto>
                <Texto variante="chico" color={colores.textoSuave}>
                  Ejemplo: {t.ejemplo}
                </Texto>
              </>
            ) : (
              <Texto variante="chico" color={colores.textoSuave}>
                Completá la lección «{obtenerLeccion(t.leccion)?.titulo}» para desbloquearlo.
              </Texto>
            )}
          </Tarjeta>
        );
      })}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacio.s },
  bloqueada: { backgroundColor: colores.fondo, borderStyle: 'dashed' },
  chip: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.redondo,
    paddingHorizontal: espacio.s,
    paddingVertical: 2,
  },
});
