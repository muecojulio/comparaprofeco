"use client";

import { usePress } from "../../lib/usePress";

/**
 * Superficie pulsable: la misma para tarjetas del catálogo, fichas de producto y
 * enlaces de "tus analizados". Aporta el hundimiento y el tilt 3D discreto de
 * `usePress` y se apoya en las clases que ya existían (`card`, `card-motion`,
 * `prod`, `guardado-link`), sin inventar un sistema paralelo.
 *
 * `as` permite conservar el elemento semántico correcto (`a`, `article`, `li`).
 */

export default function Superficie({
  as: Etiqueta = "a",
  className = "",
  inclinar,
  children,
  ...resto
}) {
  const { ref, surfaceHandlers } = usePress(inclinar ? { inclinar } : undefined);

  return (
    <Etiqueta
      {...resto}
      {...surfaceHandlers}
      ref={ref}
      className={`press-superficie ${className}`.trim()}
    >
      {children}
    </Etiqueta>
  );
}
