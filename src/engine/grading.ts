import type { Ejercicio, Respuesta } from '@/types/content';

import { normalizar } from './normalize';

/** Devuelve true si la respuesta es correcta para el ejercicio. */
export function corregir(ejercicio: Ejercicio, respuesta: Respuesta): boolean {
  switch (ejercicio.tipo) {
    case 'opcion_multiple':
      return typeof respuesta === 'string' && respuesta === ejercicio.correcta;

    case 'completar': {
      if (typeof respuesta !== 'string') return false;
      const dada = normalizar(respuesta);
      return ejercicio.respuestas.some((r) => normalizar(r) === dada);
    }

    case 'ordenar':
      return (
        Array.isArray(respuesta) &&
        respuesta.length === ejercicio.ordenCorrecto.length &&
        respuesta.every((id, i) => id === ejercicio.ordenCorrecto[i])
      );
  }
}

/** Texto de la respuesta correcta, para mostrarla cuando la persona se equivoca. */
export function respuestaCorrectaTexto(ejercicio: Ejercicio): string {
  switch (ejercicio.tipo) {
    case 'opcion_multiple':
      return ejercicio.opciones.find((o) => o.id === ejercicio.correcta)?.texto ?? '';
    case 'completar':
      return ejercicio.respuestas[0];
    case 'ordenar':
      return ejercicio.ordenCorrecto
        .map((id) => ejercicio.items.find((it) => it.id === id)?.texto ?? id)
        .join(' → ');
  }
}
