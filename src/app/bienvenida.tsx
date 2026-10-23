import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Boo } from '@/components/Boo';
import { Opcion } from '@/components/exercises/Opcion';
import { Boton } from '@/components/ui/Boton';
import { Pantalla } from '@/components/ui/Pantalla';
import { Texto } from '@/components/ui/Texto';
import { META_XP, type MetaMinutos } from '@/engine/progreso';
import { vibrar } from '@/lib/haptics';
import { useProgreso } from '@/store/progress';
import { colores, espacio, fuentes, radio } from '@/theme';

const METAS: { minutos: MetaMinutos; nombre: string }[] = [
  { minutos: 5, nombre: 'Tranqui' },
  { minutos: 10, nombre: 'Constante' },
  { minutos: 15, nombre: 'A full' },
];

/** Primera vez que se abre la app: Boo se presenta, pide el nombre y la meta diaria. */
export default function Bienvenida() {
  const guardarPerfil = useProgreso((s) => s.guardarPerfil);
  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState('');
  const [meta, setMeta] = useState<MetaMinutos>(10);

  const terminar = () => {
    vibrar.acierto();
    guardarPerfil({ nombre: nombre.trim(), metaMinutos: meta });
    router.replace('/');
  };

  if (paso === 0) {
    return (
      <Pantalla pie={<Boton titulo="¡Arranquemos!" onPress={() => setPaso(1)} />}>
        <View style={estilos.centro}>
          <Boo animo="presentandose" tamano={150} />
          <Texto variante="titulo" style={estilos.textoCentrado}>
            ¡Hola! Soy Boo
          </Texto>
          <Texto style={estilos.textoCentrado} color={colores.textoSuave}>
            Soy una gata analista y te voy a enseñar data desde cero: Excel, SQL, estadística y
            análisis. Con unos minutitos por día alcanza.
          </Texto>
        </View>
      </Pantalla>
    );
  }

  if (paso === 1) {
    return (
      <Pantalla
        pie={
          <Boton
            titulo="Continuar"
            deshabilitado={nombre.trim().length === 0}
            onPress={() => setPaso(2)}
          />
        }>
        <Boo animo="contenta" tamano={72} mensaje="¿Cómo te llamo?" />
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor={colores.textoSuave}
          autoFocus
          maxLength={24}
          returnKeyType="next"
          onSubmitEditing={() => nombre.trim() && setPaso(2)}
          accessibilityLabel="Tu nombre"
          style={estilos.input}
        />
      </Pantalla>
    );
  }

  return (
    <Pantalla pie={<Boton titulo="Empezar a aprender" onPress={terminar} />}>
      <Boo
        animo="feliz"
        tamano={72}
        mensaje={`¡Un gusto, ${nombre.trim()}! ¿Cuánto tiempo por día querés practicar?`}
      />
      <View style={{ gap: espacio.s }}>
        {METAS.map((m) => (
          <Opcion
            key={m.minutos}
            texto={`${m.nombre} · ${m.minutos} min por día (${META_XP[m.minutos]} XP)`}
            seleccionada={meta === m.minutos}
            onPress={() => {
              vibrar.toque();
              setMeta(m.minutos);
            }}
          />
        ))}
      </View>
      <Texto variante="chico" color={colores.textoSuave}>
        Lo importante no es cuánto, sino no cortar la racha 🔥
      </Texto>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espacio.m },
  textoCentrado: { textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radio.m,
    paddingHorizontal: espacio.m,
    paddingVertical: espacio.m,
    fontSize: 18,
    fontFamily: fuentes.media,
    color: colores.texto,
    backgroundColor: colores.superficie,
  },
});
