// Tipos del contenido del curso. Los JSON de src/content deben respetar esta forma
// (el test __tests__/content.test.ts lo verifica).

export type NivelId = 'inicial' | 'intermedio' | 'avanzado' | 'pro';

export type Nivel = {
  id: NivelId;
  titulo: string;
};

export type Unidad = {
  id: string;
  nivel: NivelId;
  titulo: string;
  descripcion: string;
  lecciones: string[];
  /** Reservado para el desafío por nivel (todavía no se usa). */
  desafio: string | null;
};

export type Curso = {
  version: number;
  niveles: Nivel[];
  unidades: Unidad[];
};

export type BooAnimo =
  | 'feliz'
  | 'contenta'
  | 'presentandose'
  | 'pensando'
  | 'triste'
  | 'decepcionada'
  | 'sorprendida'
  // Solo para la interfaz (no se usan en los JSON de lecciones):
  | 'enamorada'
  | 'dormida';

export type Tabla = {
  columnas: string[];
  filas: string[][];
};

// ---- Pasos de lectura (sin corrección) ----

export type PasoConcepto = {
  tipo: 'concepto';
  id: string;
  boo?: BooAnimo;
  titulo: string;
  texto: string;
};

export type PasoEjemplo = {
  tipo: 'ejemplo';
  id: string;
  titulo: string;
  texto: string;
  tabla?: Tabla;
};

// ---- Ejercicios (con corrección automática) ----

type EjercicioBase = {
  id: string;
  consigna: string;
  pista?: string;
  explicacion: string;
  tabla?: Tabla;
};

export type EjercicioOpcionMultiple = EjercicioBase & {
  tipo: 'opcion_multiple';
  opciones: { id: string; texto: string }[];
  correcta: string;
};

export type EjercicioCompletar = EjercicioBase & {
  tipo: 'completar';
  /** Frase con "___" donde va la respuesta. */
  texto: string;
  /** Respuestas aceptadas (se ignoran mayúsculas, tildes y espacios). */
  respuestas: string[];
  /** Si está, se elige de una lista de palabras en lugar de escribir. */
  banco?: string[];
};

export type EjercicioOrdenar = EjercicioBase & {
  tipo: 'ordenar';
  items: { id: string; texto: string }[];
  ordenCorrecto: string[];
};

export type Ejercicio = EjercicioOpcionMultiple | EjercicioCompletar | EjercicioOrdenar;
export type Paso = PasoConcepto | PasoEjemplo | Ejercicio;

export type Leccion = {
  id: string;
  unidad: string;
  titulo: string;
  minutos: number;
  xp: number;
  pasos: Paso[];
};

export type BooFrases = {
  acierto: string[];
  error: string[];
  pista: string[];
  resultado: { perfecto: string[]; bien: string[]; regular: string[] };
  racha_perdida: string[];
  saludo: string[];
  meta_cumplida: string[];
  dormida: string[];
  mimos: string[];
};

export type TerminoGlosario = {
  termino: string;
  definicion: string;
  ejemplo: string;
  /** Lección que desbloquea el término. */
  leccion: string;
};

/** Respuesta que da la persona, según el tipo de ejercicio. */
export type Respuesta = string | string[];

export function esEjercicio(paso: Paso): paso is Ejercicio {
  return paso.tipo !== 'concepto' && paso.tipo !== 'ejemplo';
}
