import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { useProgreso } from '@/store/progress';

// Sonidos cortos de la app. Son provisorios y sintetizados (scripts/generar-sonidos.py):
// se pueden reemplazar por grabaciones reales, ¡por ejemplo un miau de la verdadera Boo!

const ARCHIVOS = {
  acierto: require('@/assets/sonidos/acierto.wav'),
  error: require('@/assets/sonidos/error.wav'),
  combo: require('@/assets/sonidos/combo.wav'),
  terminar: require('@/assets/sonidos/terminar.wav'),
  ronroneo: require('@/assets/sonidos/ronroneo.wav'),
  miau: require('@/assets/sonidos/miau.wav'),
  clic: require('@/assets/sonidos/clic.wav'),
  impresora: require('@/assets/sonidos/impresora.wav'),
  sello: require('@/assets/sonidos/sello.wav'),
} as const;

export type NombreSonido = keyof typeof ARCHIVOS;

const reproductores: Partial<Record<NombreSonido, AudioPlayer>> = {};

/** Reproduce un sonido si el sonido está activado. Si algo falla, sigue sin sonido. */
export function sonar(nombre: NombreSonido) {
  if (!useProgreso.getState().sonido) return;
  try {
    let reproductor = reproductores[nombre];
    if (!reproductor) {
      reproductor = createAudioPlayer(ARCHIVOS[nombre]);
      reproductores[nombre] = reproductor;
    }
    reproductor.seekTo(0).catch(() => {});
    reproductor.play();
  } catch {
    // Sin sonido no pasa nada.
  }
}
