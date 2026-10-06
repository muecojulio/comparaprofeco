"use client";

import { useEffect, useRef } from "react";

/**
 * El único botón asíncrono de la app. Antes había dos (instalar investigaciones
 * y consultar datos abiertos) con el mismo markup copiado; ahora comparten uno.
 *
 *   idle     → aspecto normal.
 *   loading  → gira un indicador, `aria-busy`, deshabilitado y un candado interno
 *              que evita el doble envío aunque lleguen varios clics de golpe.
 *   success  → ✓ y confirmación (vibración discreta si se pide y el sistema lo permite).
 *   error    → ! y una sacudida breve de 2 px; el mensaje va aparte, nunca sólo el color.
 *
 * Conserva las clases `async-button` / `async-button-{estado}` y `data-state`,
 * que ya usaba el CSS existente.
 */

const ICONO = { idle: "", loading: null, success: "✓", error: "!" };

export default function AsyncButton({
  estado = "idle",
  onClick,
  children,
  iconos,
  variante = "primary",
  className = "",
  deshabilitado = false,
  vibrarEnExito = false,
  type = "button",
  ...resto
}) {
  const cargando = estado === "loading";
  const bloqueado = cargando || deshabilitado;
  const enCurso = useRef(false);
  const estadoPrevio = useRef(estado);

  useEffect(() => {
    if (vibrarEnExito && estado === "success" && estadoPrevio.current !== "success") {
      try {
        navigator.vibrate?.(12);
      } catch {}
    }
    estadoPrevio.current = estado;
  }, [estado, vibrarEnExito]);

  async function manejar(evento) {
    if (bloqueado || enCurso.current) return;
    enCurso.current = true;
    try {
      await onClick?.(evento);
    } finally {
      enCurso.current = false;
    }
  }

  const icono = iconos?.[estado] ?? ICONO[estado];

  return (
    <button
      {...resto}
      type={type}
      className={`btn btn-${variante} async-button async-button-${estado} ${className}`.trim()}
      onClick={manejar}
      disabled={bloqueado}
      aria-busy={cargando || undefined}
      aria-disabled={bloqueado || undefined}
      data-state={estado}
    >
      <span className="async-button-icon" aria-hidden="true">
        {icono}
      </span>
      <span className="async-button-label">{children}</span>
    </button>
  );
}
