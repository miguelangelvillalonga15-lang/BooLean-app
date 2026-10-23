// Colores, tipografía y medidas de BooLean. Cambiá acá para cambiar el look de toda la app.

export const colores = {
  fondo: '#0A1020',
  superficie: '#131B2E',
  superficieAlta: '#1B2540',
  borde: '#26314D',
  texto: '#F2F5FB',
  textoSuave: '#8F9BB8',
  /** Verde neón: botones principales y aciertos. */
  primario: '#13E36C',
  textoSobrePrimario: '#04130A',
  violeta: '#7B5CFF',
  violetaOscuro: '#3B23B8',
  violetaSuave: 'rgba(123, 92, 255, 0.16)',
  acierto: '#13E36C',
  aciertoSuave: 'rgba(19, 227, 108, 0.12)',
  error: '#FF5D73',
  errorSuave: 'rgba(255, 93, 115, 0.12)',
  racha: '#FF9F2E',
  xp: '#FFD23F',
  azul: '#5AA9FF',
  bloqueado: '#3A4560',
  blanco: '#FFFFFF',
} as const;

export const fuentes = {
  regular: 'Outfit_400Regular',
  media: 'Outfit_500Medium',
  seminegrita: 'Outfit_600SemiBold',
  negrita: 'Outfit_700Bold',
  extranegrita: 'Outfit_800ExtraBold',
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
  l: 24,
  redondo: 999,
} as const;

export const ANCHO_MAXIMO = 560;
