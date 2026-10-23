import { StyleSheet, View } from 'react-native';

import { Boo } from '@/components/Boo';
import { Pantalla } from '@/components/ui/Pantalla';
import { Texto } from '@/components/ui/Texto';
import { glosario, obtenerLeccion } from '@/content';
import { useProgreso } from '@/store/progress';
import { colores, espacio, radio } from '@/theme';

/** Términos aprendidos. Cada término se desbloquea al completar su lección. */
export default function Glosario() {
  const lecciones = useProgreso((s) => s.lecciones);
  const desbloqueados = glosario.filter((t) => lecciones[t.leccion]?.completada).length;

  return (
    <Pantalla bordes={['bottom']}>
      <Boo
        animo={desbloqueados > 0 ? 'contenta' : 'pensando'}
        tamano={44}
        mensaje={
          desbloqueados > 0
            ? `Ya aprendiste ${desbloqueados} de ${glosario.length} palabras. ¡Vas re bien!`
            : 'Acá van a aparecer las palabras que aprendas en cada lección.'
        }
      />
      {glosario.map((t) => {
        const abierto = lecciones[t.leccion]?.completada;
        return (
          <View key={t.termino} style={[estilos.tarjeta, !abierto && estilos.bloqueada]}>
            <Texto variante="subtitulo" color={abierto ? colores.primario : colores.textoSuave}>
              {abierto ? t.termino : `🔒 ${t.termino}`}
            </Texto>
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
          </View>
        );
      })}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    gap: espacio.xs,
    borderWidth: 2,
    borderColor: colores.borde,
    borderRadius: radio.m,
    padding: espacio.m,
  },
  bloqueada: { backgroundColor: colores.fondoSuave, borderStyle: 'dashed' },
});
