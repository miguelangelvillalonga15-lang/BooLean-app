// Racha diaria. Las fechas son strings "AAAA-MM-DD" en la hora local del celular.

export type Racha = {
  actual: number;
  mejor: number;
  ultimoDia: string | null;
};

export const RACHA_INICIAL: Racha = { actual: 0, mejor: 0, ultimoDia: null };

/** Fecha local de hoy (o de la fecha dada) como "AAAA-MM-DD". */
export function claveDia(fecha: Date = new Date()): string {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/** Días de diferencia entre dos claves de día (b - a). */
export function diasEntre(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Racha después de completar una lección el día `hoy`. */
export function registrarDia(racha: Racha, hoy: string): Racha {
  if (racha.ultimoDia === hoy) return racha;

  const seguida = racha.ultimoDia !== null && diasEntre(racha.ultimoDia, hoy) === 1;
  const actual = seguida ? racha.actual + 1 : 1;
  return { actual, mejor: Math.max(racha.mejor, actual), ultimoDia: hoy };
}

/** Racha a mostrar hoy: si pasó más de un día sin practicar, se cortó. */
export function rachaVigente(racha: Racha, hoy: string): { actual: number; perdida: boolean } {
  if (racha.ultimoDia === null) return { actual: 0, perdida: false };
  const dias = diasEntre(racha.ultimoDia, hoy);
  if (dias <= 1) return { actual: racha.actual, perdida: false };
  return { actual: 0, perdida: racha.actual > 0 };
}
