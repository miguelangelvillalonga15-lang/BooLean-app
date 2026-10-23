// Registro del contenido. React Native necesita imports estáticos,
// así que cada lección nueva se agrega acá además de en curso.json.

import type { BooFrases, Curso, Leccion, TerminoGlosario } from '@/types/content';

import booJson from './boo.json';
import cursoJson from './curso.json';
import glosarioJson from './glosario.json';
import u1l1 from './unidades/u1/u1-l1-datos-en-todos-lados.json';
import u1l2 from './unidades/u1/u1-l2-filas-columnas-tablas.json';
import u1l3 from './unidades/u1/u1-l3-el-dato-booleano.json';
import u1l4 from './unidades/u1/u1-l4-datos-sucios.json';

export const curso = cursoJson as Curso;
export const frasesBoo = booJson as BooFrases;
export const glosario = glosarioJson as TerminoGlosario[];

const listaLecciones = [u1l1, u1l2, u1l3, u1l4] as Leccion[];

export const lecciones: Record<string, Leccion> = Object.fromEntries(
  listaLecciones.map((l) => [l.id, l]),
);

export function obtenerLeccion(id: string): Leccion | undefined {
  return lecciones[id];
}
