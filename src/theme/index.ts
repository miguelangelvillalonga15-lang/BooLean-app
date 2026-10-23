// Identidad visual de BooLean. La paleta sale de Boo: el verde lima de sus ojos,
// el rosa de su nariz y su pelaje blanco y negro sobre un fondo tinta.

export const colores = {
  fondo: '#0F0D17',
  superficie: '#1A1724',
  superficieAlta: '#25202F',
  borde: '#342D43',
  /** Líneas de la cuadrícula de fondo (como una planilla). */
  grilla: 'rgba(245, 239, 230, 0.05)',
  texto: '#F5EFE6',
  textoSuave: '#A79FB5',
  /** Lima de los ojos de Boo: botones principales y aciertos. */
  primario: '#C8DC4B',
  textoSobrePrimario: '#15130B',
  primarioSuave: 'rgba(200, 220, 75, 0.14)',
  /** Lavanda: lo que está en curso o seleccionado. */
  violeta: '#A88BFF',
  violetaOscuro: '#3D2E78',
  violetaSuave: 'rgba(168, 139, 255, 0.16)',
  /** Rosa de la nariz de Boo. */
  rosa: '#FF8FA3',
  acierto: '#C8DC4B',
  aciertoSuave: 'rgba(200, 220, 75, 0.12)',
  error: '#FF6B81',
  errorSuave: 'rgba(255, 107, 129, 0.12)',
  racha: '#FF9F43',
  xp: '#FFD166',
  azul: '#6CC5FF',
  bloqueado: '#4A4259',
  blanco: '#FFFFFF',
} as const;

export const fuentes = {
  regular: 'Outfit_400Regular',
  media: 'Outfit_500Medium',
  seminegrita: 'Outfit_600SemiBold',
  negrita: 'Outfit_700Bold',
  extranegrita: 'Outfit_800ExtraBold',
  /** Monoespaciada para números, etiquetas y "código", como en una planilla o en SQL. */
  mono: 'JetBrainsMono_500Medium',
  monoNegrita: 'JetBrainsMono_700Bold',
} as const;

export const espacio = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;

export const radio = {
  s: 10,
  m: 16,
  l: 26,
  redondo: 999,
} as const;

export const ANCHO_MAXIMO = 560;

/** Lugar que ocupa la barra de pestañas flotante al pie de la pantalla. */
export const ESPACIO_PESTANAS = 96;
