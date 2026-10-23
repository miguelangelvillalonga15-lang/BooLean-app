import { StyleSheet, Text, type TextProps } from 'react-native';

import { colores } from '@/theme';

type Props = TextProps & {
  variante?: 'titulo' | 'subtitulo' | 'cuerpo' | 'chico' | 'etiqueta';
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
  titulo: { fontSize: 26, lineHeight: 32, fontWeight: '800' },
  subtitulo: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  cuerpo: { fontSize: 17, lineHeight: 25, fontWeight: '400' },
  chico: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  etiqueta: { fontSize: 13, lineHeight: 18, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  negrita: { fontWeight: '800' },
});
