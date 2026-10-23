import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useProgresoCargado } from '@/store/progress';
import { colores } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const cargado = useProgresoCargado();

  useEffect(() => {
    if (cargado) SplashScreen.hideAsync();
  }, [cargado]);

  // Esperamos a leer el progreso guardado para no mostrar datos vacíos un instante.
  if (!cargado) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="bienvenida" options={{ gestureEnabled: false }} />
        <Stack.Screen name="leccion/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="resultado" options={{ gestureEnabled: false }} />
        <Stack.Screen
          name="glosario"
          options={{
            headerShown: true,
            title: 'Glosario',
            headerTintColor: colores.primario,
            headerTitleStyle: { color: colores.texto, fontWeight: '800' },
          }}
        />
      </Stack>
    </>
  );
}
