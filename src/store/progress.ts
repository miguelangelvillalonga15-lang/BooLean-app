import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { aplicarResultado, PROGRESO_INICIAL, type Perfil, type Progreso } from '@/engine/progreso';
import type { ResultadoLeccion } from '@/engine/session';
import { claveDia } from '@/engine/streak';

type Acciones = {
  guardarPerfil: (perfil: Perfil) => void;
  registrarLeccion: (resultado: ResultadoLeccion) => void;
  reiniciar: () => void;
};

export const useProgreso = create<Progreso & Acciones>()(
  persist(
    (set) => ({
      ...PROGRESO_INICIAL,
      guardarPerfil: (perfil) => set({ perfil }),
      registrarLeccion: (resultado) =>
        set((estado) => aplicarResultado(estado, resultado, claveDia())),
      reiniciar: () => set(PROGRESO_INICIAL),
    }),
    {
      name: 'boolean-progreso',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
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
