import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ANCHO_MAXIMO, colores, espacio } from '@/theme';

import { FondoGrilla } from './FondoGrilla';

type Props = {
  children: ReactNode;
  /** Contenido fijo abajo (por ejemplo, el botón principal). */
  pie?: ReactNode;
  scroll?: boolean;
  bordes?: Edge[];
  /** Muestra la cuadrícula de fondo, como una hoja de cálculo. */
  grilla?: boolean;
  /** Espacio extra abajo, para que la barra de pestañas flotante no tape contenido. */
  espacioInferior?: number;
};

/** Contenedor base de cada pantalla: fondo, márgenes seguros y ancho máximo. */
export function Pantalla({
  children,
  pie,
  scroll = true,
  bordes = ['top', 'bottom'],
  grilla = false,
  espacioInferior = 0,
}: Props) {
  const contenido = (
    <View style={[estilos.contenido, { paddingBottom: espacio.m + espacioInferior }]}>{children}</View>
  );
  return (
    <SafeAreaView style={estilos.raiz} edges={bordes}>
      {grilla ? <FondoGrilla /> : null}
      {scroll ? (
        <ScrollView contentContainerStyle={estilos.scroll} keyboardShouldPersistTaps="handled">
          {contenido}
        </ScrollView>
      ) : (
        <View style={estilos.scroll}>{contenido}</View>
      )}
      {pie ? <View style={estilos.pie}>{pie}</View> : null}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.fondo },
  scroll: { flexGrow: 1, alignItems: 'center' },
  contenido: {
    flex: 1,
    width: '100%',
    maxWidth: ANCHO_MAXIMO,
    paddingHorizontal: espacio.m,
    paddingTop: espacio.m,
    gap: espacio.m,
  },
  pie: {
    width: '100%',
    maxWidth: ANCHO_MAXIMO,
    alignSelf: 'center',
    paddingHorizontal: espacio.m,
    paddingBottom: espacio.m,
    paddingTop: espacio.s,
  },
});
