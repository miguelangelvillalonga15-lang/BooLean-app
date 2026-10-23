// Flujo de una lección: concepto → práctica → repaso.
// Los ejercicios que se responden mal vuelven al final de la cola hasta acertarlos.

import type { Leccion, Paso, Respuesta } from '@/types/content';
import { esEjercicio } from '@/types/content';

import { corregir } from './grading';

export type ItemSesion = { paso: Paso; repaso: boolean };

export type EstadoSesion = {
  leccion: Leccion;
  cola: ItemSesion[];
  indice: number;
  /** 'respondiendo': esperando respuesta · 'feedback': mostrando si estuvo bien. */
  fase: 'respondiendo' | 'feedback';
  ultimaCorrecta: boolean | null;
  /** Ids de ejercicios que se respondieron mal al menos una vez. */
  fallados: string[];
  /** Ids de ejercicios con pista usada. */
  pistas: string[];
  /** Aciertos seguidos (se corta con un error). */
  combo: number;
  mejorCombo: number;
  terminada: boolean;
};

export type AccionSesion =
  | { tipo: 'responder'; respuesta: Respuesta }
  | { tipo: 'continuar' }
  | { tipo: 'pedir_pista' };

export function iniciarSesion(leccion: Leccion): EstadoSesion {
  return {
    leccion,
    cola: leccion.pasos.map((paso) => ({ paso, repaso: false })),
    indice: 0,
    fase: 'respondiendo',
    ultimaCorrecta: null,
    fallados: [],
    pistas: [],
    combo: 0,
    mejorCombo: 0,
    terminada: false,
  };
}

export function itemActual(estado: EstadoSesion): ItemSesion | undefined {
  return estado.cola[estado.indice];
}

export function reducirSesion(estado: EstadoSesion, accion: AccionSesion): EstadoSesion {
  if (estado.terminada) return estado;
  const item = itemActual(estado);
  if (!item) return estado;

  switch (accion.tipo) {
    case 'pedir_pista': {
      if (!esEjercicio(item.paso) || !item.paso.pista) return estado;
      if (estado.pistas.includes(item.paso.id)) return estado;
      return { ...estado, pistas: [...estado.pistas, item.paso.id] };
    }

    case 'responder': {
      if (!esEjercicio(item.paso) || estado.fase !== 'respondiendo') return estado;
      const correcta = corregir(item.paso, accion.respuesta);
      if (correcta) {
        const combo = estado.combo + 1;
        return {
          ...estado,
          fase: 'feedback',
          ultimaCorrecta: true,
          combo,
          mejorCombo: Math.max(estado.mejorCombo, combo),
        };
      }
      const fallados = estado.fallados.includes(item.paso.id)
        ? estado.fallados
        : [...estado.fallados, item.paso.id];
      return {
        ...estado,
        fase: 'feedback',
        ultimaCorrecta: false,
        combo: 0,
        fallados,
        cola: [...estado.cola, { paso: item.paso, repaso: true }],
      };
    }

    case 'continuar': {
      // En un ejercicio, solo se avanza después de ver el feedback.
      if (esEjercicio(item.paso) && estado.fase !== 'feedback') return estado;
      const indice = estado.indice + 1;
      return {
        ...estado,
        indice,
        fase: 'respondiendo',
        ultimaCorrecta: null,
        terminada: indice >= estado.cola.length,
      };
    }
  }
}

/** Avance de 0 a 1 para la barra de progreso. */
export function avance(estado: EstadoSesion): number {
  return estado.cola.length === 0 ? 1 : estado.indice / estado.cola.length;
}

export type ResultadoLeccion = {
  leccionId: string;
  total: number;
  aciertos: number;
  pistas: number;
  xp: number;
  perfecta: boolean;
  /** Claves "leccion/ejercicio" que costaron, para el repaso futuro. */
  fallados: string[];
  acertados: string[];
};

export const XP_BONUS_PERFECTA = 5;
export const XP_COSTO_PISTA = 2;
export const XP_MINIMO = 5;

export function calcularResultado(estado: EstadoSesion): ResultadoLeccion {
  const { leccion } = estado;
  const ejercicios = leccion.pasos.filter(esEjercicio).map((p) => p.id);
  const aciertos = ejercicios.filter((id) => !estado.fallados.includes(id)).length;
  const perfecta = aciertos === ejercicios.length;
  const xp = Math.max(
    XP_MINIMO,
    leccion.xp + (perfecta ? XP_BONUS_PERFECTA : 0) - estado.pistas.length * XP_COSTO_PISTA,
  );
  const clave = (id: string) => `${leccion.id}/${id}`;

  return {
    leccionId: leccion.id,
    total: ejercicios.length,
    aciertos,
    pistas: estado.pistas.length,
    xp,
    perfecta,
    fallados: estado.fallados.map(clave),
    acertados: ejercicios.filter((id) => !estado.fallados.includes(id)).map(clave),
  };
}
