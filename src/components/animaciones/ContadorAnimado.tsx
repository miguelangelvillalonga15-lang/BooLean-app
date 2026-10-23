import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { Texto } from '@/components/ui/Texto';

type Props = Omit<ComponentProps<typeof Texto>, 'children'> & {
  valor: number;
  desde?: number;
  duracion?: number;
  retraso?: number;
  prefijo?: string;
  sufijo?: string;
};

/** Número que cuenta desde `desde` hasta `valor`. */
export function ContadorAnimado({ valor, desde = 0, duracion = 900, retraso = 0, prefijo = '', sufijo = '', ...texto }: Props) {
  const [actual, setActual] = useState(desde);

  useEffect(() => {
    let cuadro: number;
    const inicio = setTimeout(() => {
      const t0 = Date.now();
      const paso = () => {
        const t = Math.min(1, (Date.now() - t0) / duracion);
        const suave = 1 - Math.pow(1 - t, 3);
        setActual(Math.round(desde + (valor - desde) * suave));
        if (t < 1) cuadro = requestAnimationFrame(paso);
      };
      cuadro = requestAnimationFrame(paso);
    }, retraso);
    return () => {
      clearTimeout(inicio);
      cancelAnimationFrame(cuadro);
    };
  }, [valor, desde, duracion, retraso]);

  return (
    <Texto {...texto}>
      {prefijo}
      {actual}
      {sufijo}
    </Texto>
  );
}
