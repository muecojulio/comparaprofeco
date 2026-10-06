"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Microinteracción de "presión" para superficies (tarjetas, fichas, opciones).
 *
 *   · Hundimiento al presionar: escala mínima y elevación cero.
 *   · Tilt 3D muy discreto siguiendo el puntero (± `inclinar` grados).
 *   · En pantallas táctiles NO se inclina: ahí basta el `:active` del CSS
 *     (más barato y sin riesgo de pelear con el scroll).
 *   · Si el usuario pide movimiento reducido, no se toca nada.
 *
 * Se escribe en variables CSS (`--press-scale`, `--press-lift`, `--press-rx`,
 * `--press-ry`) y no en `transform` directamente, para que el hover que ya
 * existía en `.card-motion` siga funcionando junto con la inclinación.
 */

export function prefiereMenosMovimiento() {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

export function usePress({ inclinar = 2.4, encoger = 0.97, hundir = 0 } = {}) {
  const ref = useRef(null);
  const origen = useRef(null);

  /* Se quitan las variables en lugar de fijarlas a un valor neutro: así el CSS
     retoma el control (por ejemplo el hover, que vuelve a levantar la tarjeta)
     y el reposo lo define `:root`. */
  const neutro = useCallback(() => {
    const nodo = ref.current;
    if (!nodo) return;
    nodo.style.removeProperty("--press-scale");
    nodo.style.removeProperty("--press-lift");
    nodo.style.removeProperty("--press-rx");
    nodo.style.removeProperty("--press-ry");
    origen.current = null;
  }, []);

  const activo = useCallback(
    (evento) => {
      const nodo = ref.current;
      if (!nodo || prefiereMenosMovimiento()) return;
      if (evento.pointerType === "touch") return; // en táctil manda el CSS

      const caja = nodo.getBoundingClientRect();
      if (!caja.width || !caja.height) return;

      origen.current = { caja, pointerId: evento.pointerId };
      nodo.style.setProperty("--press-scale", String(encoger));
      nodo.style.setProperty("--press-lift", `${hundir}px`);
      nodo.style.setProperty("--press-rx", "0deg");
      nodo.style.setProperty("--press-ry", "0deg");
    },
    [encoger, hundir]
  );

  const mover = useCallback(
    (evento) => {
      const dato = origen.current;
      const nodo = ref.current;
      if (!dato || !nodo || dato.pointerId !== evento.pointerId) return;

      const { caja } = dato;
      const x = Math.max(0, Math.min(1, (evento.clientX - caja.left) / caja.width));
      const y = Math.max(0, Math.min(1, (evento.clientY - caja.top) / caja.height));
      // Centro = 0°; esquinas = ±inclinar.
      nodo.style.setProperty("--press-ry", `${((x - 0.5) * 2 * inclinar).toFixed(2)}deg`);
      nodo.style.setProperty("--press-rx", `${((0.5 - y) * 2 * inclinar).toFixed(2)}deg`);
    },
    [inclinar]
  );

  useEffect(() => neutro, [neutro]);

  return {
    ref,
    surfaceHandlers: {
      onPointerDown: activo,
      onPointerMove: mover,
      onPointerUp: neutro,
      onPointerCancel: neutro,
      onPointerLeave: neutro,
      onBlur: neutro
    },
    limpiar: neutro
  };
}

export default usePress;
