import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { Texto } from '@/components/ui/Texto';

type Props = Omit<ComponentProps<typeof Texto>, 'children'> & {
  /** Texto que se borra primero. */
  de: string;
  /** Texto que se escribe después. */
  a: string;
  retraso?: number;
  alTipear?: () => void;
  alTerminar?: () => void;
};

/** Borra `de` letra por letra y tipea `a`, como si alguien escribiera en la celda. */
export function TextoTipeado({ de, a, retraso = 0, alTipear, alTerminar, ...texto }: Props) {
  const [mostrado, setMostrado] = useState(de);
  const [escribiendo, setEscribiendo] = useState(false);

  useEffect(() => {
    const pasos = [
      ...Array.from({ length: de.length }, (_, i) => de.slice(0, de.length - 1 - i)),
      ...Array.from({ length: a.length }, (_, i) => a.slice(0, i + 1)),
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setEscribiendo(true), retraso));
    pasos.forEach((paso, i) => {
      timers.push(
        setTimeout(() => {
          setMostrado(paso);
          alTipear?.();
        }, retraso + (i + 1) * 75),
      );
    });
    timers.push(
      setTimeout(() => {
        setEscribiendo(false);
        alTerminar?.();
      }, retraso + (pasos.length + 1) * 75),
    );
    return () => timers.forEach(clearTimeout);
    // Solo se tipea una vez por montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Texto {...texto}>
      {mostrado}
      {escribiendo ? '▌' : ''}
    </Texto>
  );
}
