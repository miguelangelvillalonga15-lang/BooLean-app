// Progreso de la persona: XP, racha, meta diaria y lecciones completadas.
// Funciones puras: el store (src/store/progress.ts) las usa y guarda el resultado.

import type { Curso } from '@/types/content';

import type { ResultadoLeccion } from './session';
import { RACHA_INICIAL, registrarDia, type Racha } from './streak';

export type MetaMinutos = 5 | 10 | 15;

export type Perfil = {
  nombre: string;
  metaMinutos: MetaMinutos;
};

export type ProgresoLeccion = {
  completada: boolean;
  mejorPuntaje: number;
  intentos: number;
};

export type Progreso = {
  version: 2;
  perfil: Perfil | null;
  xpTotal: number;
  racha: Racha;
  /** XP ganado por día ("AAAA-MM-DD" → XP), para la meta diaria y el gráfico de la semana. */
  historial: Record<string, number>;
  lecciones: Record<string, ProgresoLeccion>;
  paraRepasar: string[];
};

export const PROGRESO_INICIAL: Progreso = {
  version: 2,
  perfil: null,
  xpTotal: 0,
  racha: RACHA_INICIAL,
  historial: {},
  lecciones: {},
  paraRepasar: [],
};

/** XP diario según los minutos elegidos (una lección corta da unos 15 XP). */
export const META_XP: Record<MetaMinutos, number> = { 5: 15, 10: 30, 15: 45 };

export function xpDeHoy(progreso: Progreso, hoy: string): number {
  return progreso.historial[hoy] ?? 0;
}

/** Los últimos `n` días terminando en `hoy`, del más viejo al más nuevo, con su XP. */
export function ultimosDias(progreso: Progreso, hoy: string, n = 7): { fecha: string; xp: number }[] {
  const base = Date.parse(`${hoy}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) => {
    const fecha = new Date(base - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10);
    return { fecha, xp: progreso.historial[fecha] ?? 0 };
  });
}

export function aplicarResultado(
  progreso: Progreso,
  resultado: ResultadoLeccion,
  hoy: string,
): Progreso {
  const previo = progreso.lecciones[resultado.leccionId];
  const puntaje = resultado.total === 0 ? 1 : resultado.aciertos / resultado.total;

  const paraRepasar = new Set(progreso.paraRepasar);
  resultado.acertados.forEach((k) => paraRepasar.delete(k));
  resultado.fallados.forEach((k) => paraRepasar.add(k));

  return {
    ...progreso,
    xpTotal: progreso.xpTotal + resultado.xp,
    racha: registrarDia(progreso.racha, hoy),
    historial: { ...progreso.historial, [hoy]: xpDeHoy(progreso, hoy) + resultado.xp },
    lecciones: {
      ...progreso.lecciones,
      [resultado.leccionId]: {
        completada: true,
        mejorPuntaje: Math.max(previo?.mejorPuntaje ?? 0, puntaje),
        intentos: (previo?.intentos ?? 0) + 1,
      },
    },
    paraRepasar: [...paraRepasar],
  };
}

export type EstadoLeccion = 'completada' | 'disponible' | 'bloqueada';

/** Las lecciones se desbloquean en orden: hay que terminar la anterior. */
export function estadoLeccion(curso: Curso, progreso: Progreso, leccionId: string): EstadoLeccion {
  if (progreso.lecciones[leccionId]?.completada) return 'completada';
  const orden = curso.unidades.flatMap((u) => u.lecciones);
  const i = orden.indexOf(leccionId);
  if (i <= 0) return i === 0 ? 'disponible' : 'bloqueada';
  return progreso.lecciones[orden[i - 1]]?.completada ? 'disponible' : 'bloqueada';
}

/** Primera lección sin completar, para el botón "Seguir aprendiendo". */
export function siguienteLeccion(curso: Curso, progreso: Progreso): string | null {
  const orden = curso.unidades.flatMap((u) => u.lecciones);
  return orden.find((id) => !progreso.lecciones[id]?.completada) ?? null;
}
