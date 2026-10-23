import { View } from 'react-native';

import type { EjercicioOpcionMultiple } from '@/types/content';
import { vibrar } from '@/lib/haptics';
import { espacio } from '@/theme';

import { Opcion } from './Opcion';

type Props = {
  ejercicio: EjercicioOpcionMultiple;
  respuesta: string | null;
  onCambiar: (respuesta: string) => void;
  bloqueado: boolean;
};

export function OpcionMultiple({ ejercicio, respuesta, onCambiar, bloqueado }: Props) {
  return (
    <View style={{ gap: espacio.s }}>
      {ejercicio.opciones.map((op) => (
        <Opcion
          key={op.id}
          texto={op.texto}
          seleccionada={respuesta === op.id}
          deshabilitada={bloqueado && respuesta !== op.id}
          onPress={() => {
            vibrar.toque();
            onCambiar(op.id);
          }}
        />
      ))}
    </View>
  );
}
