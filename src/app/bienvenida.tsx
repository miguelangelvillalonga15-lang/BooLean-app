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
      <Pantalla grilla pie={<Boton titulo="¡Arranquemos!" onPress={() => setPaso(1)} />}>
        <View style={estilos.centro}>
          <Boo animo="presentandose" tamano={170} />
          <View style={estilos.marca}>
            <Texto style={estilos.logo}>
              Boo<Texto style={[estilos.logo, { color: colores.primario }]}>Lean</Texto>
            </Texto>
            <Texto variante="codigo" color={colores.textoSuave}>
              aprendés_data = VERDADERO
            </Texto>
          </View>
          <Texto style={estilos.textoCentrado} color={colores.textoSuave}>
            Soy Boo, una gata analista. Te voy a enseñar data desde cero: Excel, SQL, estadística
            y análisis, con unos minutitos por día.
          </Texto>
        </View>
      </Pantalla>
    );
  }

  if (paso === 1) {
    return (
      <Pantalla
        grilla
        pie={
          <Boton
            titulo="Continuar"
            deshabilitado={nombre.trim().length === 0}
            onPress={() => setPaso(2)}
          />
        }>
        <Texto variante="etiqueta" color={colores.violeta}>
          Paso 1 de 2
        </Texto>
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
    <Pantalla grilla pie={<Boton titulo="Empezar a aprender" onPress={terminar} />}>
      <Texto variante="etiqueta" color={colores.violeta}>
        Paso 2 de 2
      </Texto>
      <Boo
        animo="feliz"
        tamano={72}
        mensaje={`¡Un gusto, ${nombre.trim()}! ¿Cuánto tiempo por día querés practicar?`}
      />
      <View style={{ gap: espacio.s }}>
        {METAS.map((m, i) => (
          <Opcion
            key={m.minutos}
            letra={String.fromCharCode(65 + i)}
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
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espacio.l },
  marca: { alignItems: 'center', gap: espacio.xs },
  logo: { fontFamily: fuentes.extranegrita, fontSize: 44, lineHeight: 50, letterSpacing: -1, color: colores.texto },
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
