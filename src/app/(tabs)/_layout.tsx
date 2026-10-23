import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { useProgreso } from '@/store/progress';
import { colores, fuentes } from '@/theme';

type NombreIcono = keyof typeof Ionicons.glyphMap;

function icono(activo: NombreIcono, inactivo: NombreIcono) {
  return function IconoPestana({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) {
    return <Ionicons name={focused ? activo : inactivo} color={color as string} size={size} />;
  };
}

/** Barra de pestañas de abajo: Inicio, Aprender y Glosario. */
export default function LayoutPestanas() {
  const tienePerfil = useProgreso((s) => s.perfil !== null);
  if (!tienePerfil) return <Redirect href="/bienvenida" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colores.fondo },
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
          height: 68,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colores.texto,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: { fontFamily: fuentes.media, fontSize: 13 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: icono('home', 'home-outline') }} />
      <Tabs.Screen
        name="aprender"
        options={{ title: 'Aprender', tabBarIcon: icono('map', 'map-outline') }}
      />
      <Tabs.Screen
        name="glosario"
        options={{ title: 'Glosario', tabBarIcon: icono('book', 'book-outline') }}
      />
    </Tabs>
  );
}
