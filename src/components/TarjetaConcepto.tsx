import { StyleSheet, View } from 'react-native';

import type { PasoConcepto, PasoEjemplo } from '@/types/content';
import { colores, espacio, radio } from '@/theme';

import { Boo } from './Boo';
import { TablaDatos } from './TablaDatos';
import { Texto, TextoRico } from './ui/Texto';

/** Pasos de lectura: un concepto nuevo o un ejemplo guiado. */
export function TarjetaConcepto({ paso }: { paso: PasoConcepto | PasoEjemplo }) {
  const esEjemplo = paso.tipo === 'ejemplo';
  return (
    <View style={estilos.contenedor}>
      <Texto variante="etiqueta" color={esEjemplo ? colores.racha : colores.primario}>
        {esEjemplo ? 'Ejemplo' : 'Concepto nuevo'}
      </Texto>
      {paso.tipo === 'concepto' ? <Boo animo={paso.boo ?? 'feliz'} tamano={56} /> : null}
      <Texto variante="titulo">{paso.titulo}</Texto>
      {paso.tipo === 'ejemplo' && paso.tabla ? <TablaDatos tabla={paso.tabla} /> : null}
      <View style={estilos.cuerpo}>
        {paso.texto.split('\n\n').map((parrafo, i) => (
          <TextoRico key={i}>{parrafo}</TextoRico>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: espacio.m },
  cuerpo: {
    gap: espacio.m,
    backgroundColor: colores.fondoSuave,
    borderRadius: radio.m,
    padding: espacio.m,
  },
});
