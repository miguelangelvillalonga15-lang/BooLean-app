import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { aplicarResultado, PROGRESO_INICIAL, type Perfil, type Progreso } from '@/engine/progreso';
import type { ResultadoLeccion } from '@/engine/session';
import { claveDia } from '@/engine/streak';

/** Preferencias y avisos de la interfaz (no son parte del progreso de aprendizaje). */
type EstadoUI = {
  sonido: boolean;
  /** Lección recién completada por primera vez: el camino anima sus huellitas. */
  huellasPendientes: string | null;
  /** Día en que ya se festejó la meta cumplida en la planilla del inicio. */
  metaCelebrada: string | null;
};

type Acciones = {
  guardarPerfil: (perfil: Perfil) => void;
  registrarLeccion: (resultado: ResultadoLeccion) => void;
  alternarSonido: () => void;
  marcarHuellasVistas: () => void;
  marcarMetaCelebrada: (dia: string) => void;
  reiniciar: () => void;
};

const UI_INICIAL: EstadoUI = { sonido: true, huellasPendientes: null, metaCelebrada: null };

export const useProgreso = create<Progreso & EstadoUI & Acciones>()(
  persist(
    (set) => ({
      ...PROGRESO_INICIAL,
      ...UI_INICIAL,
      guardarPerfil: (perfil) => set({ perfil }),
      registrarLeccion: (resultado) =>
        set((estado) => ({
          ...aplicarResultado(estado, resultado, claveDia()),
          huellasPendientes: estado.lecciones[resultado.leccionId]?.completada
            ? estado.huellasPendientes
            : resultado.leccionId,
        })),
      alternarSonido: () => set((estado) => ({ sonido: !estado.sonido })),
      marcarHuellasVistas: () => set({ huellasPendientes: null }),
      marcarMetaCelebrada: (dia) => set({ metaCelebrada: dia }),
      reiniciar: () => set({ ...PROGRESO_INICIAL, ...UI_INICIAL }),
    }),
    {
      name: 'boolean-progreso',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // v1 guardaba solo el XP de hoy; v2 guarda el historial por día.
      migrate: (guardado, version) => {
        const estado = guardado as Partial<Progreso> & { xpDelDia?: { fecha: string; xp: number } };
        if (version < 2) {
          const { xpDelDia, ...resto } = estado;
          return {
            ...resto,
            version: 2,
            historial: xpDelDia?.fecha ? { [xpDelDia.fecha]: xpDelDia.xp } : {},
          } as Progreso & EstadoUI & Acciones;
        }
        return estado as Progreso & EstadoUI & Acciones;
      },
    },
  ),
);

/** true cuando ya se cargó el progreso guardado en el celular. */
export function useProgresoCargado(): boolean {
  return useSyncExternalStore(
    (avisar) => useProgreso.persist.onFinishHydration(avisar),
    () => useProgreso.persist.hasHydrated(),
  );
}
