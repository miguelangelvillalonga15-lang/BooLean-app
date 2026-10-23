import { StyleSheet, View } from 'react-native';

import { BarraCrece } from '@/components/animaciones/BarraCrece';
import { Texto } from '@/components/ui/Texto';
import { colores, espacio, radio } from '@/theme';

const INICIALES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

type Props = {
  dias: { fecha: string; xp: number }[];
  hoy: string;
  /** XP de la meta diaria: se marca con una línea punteada. */
  meta: number;
};

/** Barras con el XP de cada día de la última semana. */
export function GraficoSemana({ dias, hoy, meta }: Props) {
  const maximo = Math.max(meta, ...dias.map((d) => d.xp));
  const ALTO = 96;
  const yMeta = ALTO * (1 - meta / maximo);

  return (
    <View
      accessible
      accessibilityLabel={`XP de los últimos 7 días: ${dias.map((d) => d.xp).join(', ')}`}>
      <View style={[estilos.zona, { height: ALTO }]}>
        <View style={[estilos.lineaMeta, { top: yMeta }]} />
        {dias.map((d, i) => {
          const esHoy = d.fecha === hoy;
          const alto = d.xp === 0 ? 4 : Math.max(10, (d.xp / maximo) * ALTO);
          const color = d.xp >= meta ? colores.primario : d.xp > 0 ? colores.violeta : colores.superficieAlta;
          return (
            <View key={d.fecha} style={estilos.columna}>
              {d.xp > 0 ? (
                <Texto variante="codigo" style={estilos.valor} color={colores.textoSuave}>
                  {d.xp}
                </Texto>
              ) : null}
              <BarraCrece
                alto={alto}
                retraso={i * 80}
                style={[estilos.barra, { backgroundColor: color }, esHoy && estilos.barraHoy]}
              />
            </View>
          );
        })}
      </View>
      <View style={estilos.etiquetas}>
        {dias.map((d) => (
          <Texto
            key={d.fecha}
            variante="etiqueta"
            style={estilos.dia}
            color={d.fecha === hoy ? colores.texto : colores.textoSuave}>
            {INICIALES[new Date(`${d.fecha}T12:00:00Z`).getUTCDay()]}
          </Texto>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  zona: { flexDirection: 'row', alignItems: 'flex-end', gap: espacio.s },
  lineaMeta: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colores.racha,
    opacity: 0.6,
  },
  columna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  valor: { fontSize: 11, lineHeight: 14 },
  barra: { width: '100%', borderRadius: radio.s - 4 },
  barraHoy: { borderWidth: 2, borderColor: colores.texto },
  etiquetas: { flexDirection: 'row', gap: espacio.s, marginTop: espacio.s },
  dia: { flex: 1, textAlign: 'center' },
});
