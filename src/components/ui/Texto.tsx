import { StyleSheet, Text, type TextProps } from 'react-native';

import { colores, fuentes } from '@/theme';

type Props = TextProps & {
  variante?: 'titulo' | 'subtitulo' | 'cuerpo' | 'chico' | 'etiqueta' | 'numero' | 'codigo';
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
  titulo: { fontFamily: fuentes.negrita, fontSize: 30, lineHeight: 35, letterSpacing: -0.5 },
  subtitulo: { fontFamily: fuentes.seminegrita, fontSize: 21, lineHeight: 27 },
  cuerpo: { fontFamily: fuentes.regular, fontSize: 17, lineHeight: 25 },
  chico: { fontFamily: fuentes.regular, fontSize: 15, lineHeight: 21 },
  etiqueta: { fontFamily: fuentes.monoNegrita, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
  numero: { fontFamily: fuentes.monoNegrita, fontSize: 20, lineHeight: 24 },
  codigo: { fontFamily: fuentes.mono, fontSize: 14, lineHeight: 20 },
  negrita: { fontFamily: fuentes.negrita },
});
