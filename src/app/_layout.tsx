import { Outfit_400Regular } from '@expo-google-fonts/outfit/400Regular';
import { Outfit_500Medium } from '@expo-google-fonts/outfit/500Medium';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { Outfit_800ExtraBold } from '@expo-google-fonts/outfit/800ExtraBold';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useProgresoCargado } from '@/store/progress';
import { colores } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const cargado = useProgresoCargado();
  const [fuentesListas, errorFuentes] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    ...Ionicons.font,
  });
  // Si las fuentes fallan, seguimos igual con la fuente del sistema.
  const listo = cargado && (fuentesListas || errorFuentes !== null);

  useEffect(() => {
    if (listo) SplashScreen.hideAsync();
  }, [listo]);

  // Esperamos a leer el progreso guardado y las fuentes para no mostrar la app a medias.
  if (!listo) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.fondo },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="bienvenida" options={{ gestureEnabled: false }} />
        <Stack.Screen name="leccion/[id]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="resultado" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}
