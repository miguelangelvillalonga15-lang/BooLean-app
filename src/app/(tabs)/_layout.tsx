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
        // Barra flotante en forma de píldora, separada de los bordes.
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: 32,
          borderTopWidth: 1,
          borderWidth: 1,
          borderColor: colores.borde,
          borderTopColor: colores.borde,
          backgroundColor: colores.superficieAlta,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        },
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: { fontFamily: fuentes.monoNegrita, fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
        tabBarItemStyle: { justifyContent: 'center', gap: 2 },
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
