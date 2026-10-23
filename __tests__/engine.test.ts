import { describe, expect, it } from '@jest/globals';
import { obtenerLeccion } from '@/content';
import { corregir } from '@/engine/grading';
import { normalizar } from '@/engine/normalize';
import {
  aplicarResultado,
  estadoLeccion,
  PROGRESO_INICIAL,
  siguienteLeccion,
  ultimosDias,
} from '@/engine/progreso';
import { calcularResultado, iniciarSesion, reducirSesion, type EstadoSesion } from '@/engine/session';
import { diasEntre, rachaVigente, registrarDia, RACHA_INICIAL } from '@/engine/streak';
import { curso } from '@/content';
import type { Ejercicio, Leccion } from '@/types/content';

describe('normalizar', () => {
  it('ignora mayúsculas, tildes y espacios', () => {
    expect(normalizar('  Número  ')).toBe('numero');
    expect(normalizar('VERDADERO   o  falso')).toBe('verdadero o falso');
  });
});

describe('corregir', () => {
  const om: Ejercicio = {
    tipo: 'opcion_multiple',
    id: 'p',
    consigna: '',
    explicacion: '',
    opciones: [
      { id: 'a', texto: 'A' },
      { id: 'b', texto: 'B' },
    ],
    correcta: 'b',
  };
  const completar: Ejercicio = {
    tipo: 'completar',
    id: 'p',
    consigna: '',
    explicacion: '',
    texto: 'x ___',
    respuestas: ['número', 'numérico'],
  };
  const ordenar: Ejercicio = {
    tipo: 'ordenar',
    id: 'p',
    consigna: '',
    explicacion: '',
    items: [
      { id: 'x', texto: 'X' },
      { id: 'y', texto: 'Y' },
    ],
    ordenCorrecto: ['y', 'x'],
  };

  it('opción múltiple', () => {
    expect(corregir(om, 'b')).toBe(true);
    expect(corregir(om, 'a')).toBe(false);
  });

  it('completar acepta variantes sin tildes ni mayúsculas', () => {
    expect(corregir(completar, 'NUMERO')).toBe(true);
    expect(corregir(completar, ' numerico ')).toBe(true);
    expect(corregir(completar, 'texto')).toBe(false);
  });

  it('ordenar exige el orden exacto', () => {
    expect(corregir(ordenar, ['y', 'x'])).toBe(true);
    expect(corregir(ordenar, ['x', 'y'])).toBe(false);
    expect(corregir(ordenar, ['y'])).toBe(false);
  });
});

describe('racha', () => {
  it('cuenta días entre fechas', () => {
    expect(diasEntre('2026-02-28', '2026-03-01')).toBe(1);
    expect(diasEntre('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('sube si practicás días seguidos y no se duplica el mismo día', () => {
    let r = registrarDia(RACHA_INICIAL, '2026-10-20');
    r = registrarDia(r, '2026-10-21');
    r = registrarDia(r, '2026-10-21');
    expect(r).toEqual({ actual: 2, mejor: 2, ultimoDia: '2026-10-21' });
  });

  it('vuelve a 1 si saltaste un día, pero guarda la mejor', () => {
    const r = registrarDia({ actual: 5, mejor: 5, ultimoDia: '2026-10-18' }, '2026-10-21');
    expect(r).toEqual({ actual: 1, mejor: 5, ultimoDia: '2026-10-21' });
  });

  it('se muestra como perdida si pasó más de un día', () => {
    const r = { actual: 3, mejor: 3, ultimoDia: '2026-10-20' };
    expect(rachaVigente(r, '2026-10-21')).toEqual({ actual: 3, perdida: false });
    expect(rachaVigente(r, '2026-10-22')).toEqual({ actual: 0, perdida: true });
  });
});

/** Recorre una lección respondiendo bien o mal según `fallar`. */
function jugar(leccion: Leccion, fallar: (id: string, intento: number) => boolean): EstadoSesion {
  let estado = iniciarSesion(leccion);
  const intentos: Record<string, number> = {};
  for (let guard = 0; !estado.terminada && guard < 200; guard++) {
    const { paso } = estado.cola[estado.indice];
    if (paso.tipo === 'concepto' || paso.tipo === 'ejemplo') {
      estado = reducirSesion(estado, { tipo: 'continuar' });
      continue;
    }
    intentos[paso.id] = (intentos[paso.id] ?? 0) + 1;
    const correcta =
      paso.tipo === 'opcion_multiple'
        ? paso.correcta
        : paso.tipo === 'completar'
          ? paso.respuestas[0]
          : paso.ordenCorrecto;
    const respuesta = fallar(paso.id, intentos[paso.id]) ? '__mal__' : correcta;
    estado = reducirSesion(estado, { tipo: 'responder', respuesta });
    estado = reducirSesion(estado, { tipo: 'continuar' });
  }
  return estado;
}

describe('sesión de lección', () => {
  const leccion = obtenerLeccion('u1-l3')!;

  it('una lección sin errores es perfecta y da bonus', () => {
    const estado = jugar(leccion, () => false);
    expect(estado.terminada).toBe(true);
    const r = calcularResultado(estado);
    expect(r.perfecta).toBe(true);
    expect(r.aciertos).toBe(r.total);
    expect(r.xp).toBe(leccion.xp + 5);
  });

  it('los ejercicios fallados vuelven como repaso hasta acertarlos', () => {
    const estado = jugar(leccion, (id, intento) => id === 'p1' && intento <= 2);
    const repasos = estado.cola.filter((i) => i.repaso && i.paso.id === 'p1');
    expect(repasos).toHaveLength(2);
    const r = calcularResultado(estado);
    expect(r.perfecta).toBe(false);
    expect(r.fallados).toEqual(['u1-l3/p1']);
    expect(r.xp).toBe(leccion.xp);
  });

  it('no avanza un ejercicio sin responder', () => {
    let estado = iniciarSesion(leccion);
    while (estado.cola[estado.indice].paso.tipo === 'concepto' || estado.cola[estado.indice].paso.tipo === 'ejemplo') {
      estado = reducirSesion(estado, { tipo: 'continuar' });
    }
    const indice = estado.indice;
    expect(reducirSesion(estado, { tipo: 'continuar' }).indice).toBe(indice);
  });

  it('las pistas restan XP', () => {
    let estado = iniciarSesion(leccion);
    while (estado.cola[estado.indice].paso.id !== 'p1') {
      estado = reducirSesion(estado, { tipo: 'continuar' });
    }
    estado = reducirSesion(estado, { tipo: 'pedir_pista' });
    estado = reducirSesion(estado, { tipo: 'pedir_pista' });
    expect(estado.pistas).toEqual(['p1']);
  });
});

describe('progreso', () => {
  it('desbloquea lecciones en orden y suma XP, racha y meta diaria', () => {
    expect(estadoLeccion(curso, PROGRESO_INICIAL, 'u1-l1')).toBe('disponible');
    expect(estadoLeccion(curso, PROGRESO_INICIAL, 'u1-l2')).toBe('bloqueada');

    const r = calcularResultado(jugar(obtenerLeccion('u1-l1')!, (id, n) => id === 'p2' && n === 1));
    const p = aplicarResultado(PROGRESO_INICIAL, r, '2026-10-23');

    expect(estadoLeccion(curso, p, 'u1-l1')).toBe('completada');
    expect(estadoLeccion(curso, p, 'u1-l2')).toBe('disponible');
    expect(siguienteLeccion(curso, p)).toBe('u1-l2');
    expect(p.xpTotal).toBe(r.xp);
    expect(p.historial).toEqual({ '2026-10-23': r.xp });
    expect(p.racha.actual).toBe(1);
    expect(p.paraRepasar).toEqual(['u1-l1/p2']);

    // Si al repetirla la acierta, sale de la lista de repaso.
    const r2 = calcularResultado(jugar(obtenerLeccion('u1-l1')!, () => false));
    const p2 = aplicarResultado(p, r2, '2026-10-23');
    expect(p2.paraRepasar).toEqual([]);
    expect(p2.lecciones['u1-l1'].intentos).toBe(2);
    expect(p2.racha.actual).toBe(1);
  });
});

describe('historial', () => {
  it('devuelve los últimos 7 días con su XP, cruzando de mes', () => {
    const p = { ...PROGRESO_INICIAL, historial: { '2026-10-01': 20, '2026-09-28': 15 } };
    const dias = ultimosDias(p, '2026-10-01');
    expect(dias).toHaveLength(7);
    expect(dias[0]).toEqual({ fecha: '2026-09-25', xp: 0 });
    expect(dias[3]).toEqual({ fecha: '2026-09-28', xp: 15 });
    expect(dias[6]).toEqual({ fecha: '2026-10-01', xp: 20 });
  });
});
