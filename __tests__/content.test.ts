// Valida todos los JSON del curso. Si agregás o editás una lección y algo no cierra
// (una respuesta que no existe, un id repetido, un tipo mal escrito), este test avisa.

import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';

import { curso, frasesBoo, glosario, lecciones } from '@/content';

const tabla = z.object({
  columnas: z.array(z.string()).min(1),
  filas: z.array(z.array(z.string())),
});

const animo = z.enum(['feliz', 'contenta', 'presentandose', 'pensando', 'triste', 'decepcionada', 'sorprendida']);

const base = {
  id: z.string().min(1),
  consigna: z.string().min(1),
  pista: z.string().min(1).optional(),
  explicacion: z.string().min(1),
  tabla: tabla.optional(),
};

const paso = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('concepto'), id: z.string(), boo: animo.optional(), titulo: z.string(), texto: z.string() }).strict(),
  z.object({ tipo: z.literal('ejemplo'), id: z.string(), titulo: z.string(), texto: z.string(), tabla: tabla.optional() }).strict(),
  z
    .object({
      ...base,
      tipo: z.literal('opcion_multiple'),
      opciones: z.array(z.object({ id: z.string(), texto: z.string() })).min(2),
      correcta: z.string(),
    })
    .strict(),
  z
    .object({
      ...base,
      tipo: z.literal('completar'),
      texto: z.string().includes('___'),
      respuestas: z.array(z.string()).min(1),
      banco: z.array(z.string()).min(2).optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      tipo: z.literal('ordenar'),
      items: z.array(z.object({ id: z.string(), texto: z.string() })).min(2),
      ordenCorrecto: z.array(z.string()),
    })
    .strict(),
]);

const leccionSchema = z
  .object({
    id: z.string(),
    unidad: z.string(),
    titulo: z.string(),
    minutos: z.number().positive().max(10),
    xp: z.number().positive(),
    pasos: z.array(paso).min(1),
  })
  .strict();

describe('contenido', () => {
  it('cada lección del curso existe y respeta el formato', () => {
    for (const unidad of curso.unidades) {
      for (const id of unidad.lecciones) {
        const leccion = lecciones[id];
        expect(leccion).toBeDefined();
        leccionSchema.parse(leccion);
        expect(leccion.unidad).toBe(unidad.id);
        expect(curso.niveles.map((n) => n.id)).toContain(unidad.nivel);
      }
    }
  });

  it.each(Object.values(lecciones).map((l) => [l.id, l] as const))('%s tiene respuestas coherentes', (_, leccion) => {
    const ids = leccion.pasos.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const p of leccion.pasos) {
      if (p.tipo === 'opcion_multiple') {
        expect(p.opciones.map((o) => o.id)).toContain(p.correcta);
      }
      if (p.tipo === 'completar') {
        expect(p.texto.split('___')).toHaveLength(2);
        if (p.banco) expect(p.banco).toContain(p.respuestas[0]);
      }
      if (p.tipo === 'ordenar') {
        expect([...p.ordenCorrecto].sort()).toEqual(p.items.map((i) => i.id).sort());
      }
      if (p.tipo !== 'concepto' && p.tabla) {
        p.tabla.filas.forEach((f) => expect(f).toHaveLength(p.tabla!.columnas.length));
      }
    }
  });

  it('el glosario apunta a lecciones que existen', () => {
    for (const t of glosario) expect(lecciones[t.leccion]).toBeDefined();
  });

  it('Boo tiene frases para cada situación', () => {
    const listas = [
      frasesBoo.acierto,
      frasesBoo.error,
      frasesBoo.pista,
      frasesBoo.racha_perdida,
      frasesBoo.saludo,
      frasesBoo.meta_cumplida,
      ...Object.values(frasesBoo.resultado),
    ];
    listas.forEach((l) => expect(l.length).toBeGreaterThan(0));
  });
});
