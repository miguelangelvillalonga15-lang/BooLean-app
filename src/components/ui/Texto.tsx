import { StyleSheet, Text, type TextProps } from 'react-native';

import { colores, fuentes } from '@/theme';

type Props = TextProps & {
  variante?: 'titulo' | 'subtitulo' | 'cuerpo' | 'chico' | 'etiqueta' | 'numero';
  color?: string;
};

export function Texto({ variante = 'cuerpo', color = colores.texto, style, ...rest }: Props) {
  return <Text style={[estilos[variante], { color }, style]} {...rest} />;
}

/** Texto con **negritas**: lo que va entre dobles asteriscos se muestra en negrita. */
export function TextoRico({ children, ...props }: Omit<Props, 'children'> & { children: string }) {
  const partes = children.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Texto {...props}>
      {partes.map((parte, i) =>
        parte.startsWith('**') && parte.endsWith('**') ? (
          <Text key={i} style={estilos.negrita}>
            {parte.slice(2, -2)}
          </Text>
        ) : (
          parte
        ),
      )}
    </Texto>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontFamily: fuentes.seminegrita, fontSize: 28, lineHeight: 34 },
  subtitulo: { fontFamily: fuentes.seminegrita, fontSize: 21, lineHeight: 27 },
  cuerpo: { fontFamily: fuentes.regular, fontSize: 17, lineHeight: 25 },
  chico: { fontFamily: fuentes.regular, fontSize: 15, lineHeight: 21 },
  etiqueta: { fontFamily: fuentes.negrita, fontSize: 13, lineHeight: 18, letterSpacing: 0.6, textTransform: 'uppercase' },
  numero: { fontFamily: fuentes.negrita, fontSize: 20, lineHeight: 24 },
  negrita: { fontFamily: fuentes.negrita },
});
