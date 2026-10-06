"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Paneles de pestañas con tres formas de moverse:
 *   · tocando una pestaña (lo maneja `SegmentedTabs`, fuera de este archivo);
 *   · con las flechas ←/→ cuando el panel tiene el foco;
 *   · con un deslizamiento horizontal sobre el contenido.
 *
 * El gesto es deliberadamente exigente para no robar el scroll vertical ni los
 * controles que viven dentro del panel:
 *   · se ignora si empieza sobre botón, enlace, campo, selector, pestaña, mapa
 *     o cualquier zona marcada con `data-no-swipe`;
 *   · se cancela si el movimiento se inclina a vertical (proporción 1.2);
 *   · necesita 52 px de recorrido, o 28 px si fue rápido (0.55 px/ms).
 *
 * Mientras el dedo se mueve, el panel acompaña hasta 56 px (amortiguado) y
 * regresa solo si el gesto no se completa. Con `prefers-reduced-motion` se
 * desactiva el acompañamiento y el cruce animado.
 */

const CONTROL =
  "button, a, input, select, textarea, label, [role='button'], [role='tab'], [role='switch'], [role='option'], [role='combobox'], [role='listbox'], [role='slider'], [contenteditable='true'], [data-no-swipe], iframe, canvas, video, audio, [data-map], .map, .leaflet-container, .mapboxgl-map, .scroll-rail, .overflow-rail, .switch";

const PROPORCION = 1.2; // |dx| debe superar |dy| × 1.2
const RECORRIDO = 52; // px
const RECORRIDO_RAPIDO = 28; // px, si además fue rápido
const VELOCIDAD = 0.55; // px/ms
const TOPE = 78; // px que acompaña el panel (así se siente el arrastre)
const AMORTIGUAR = 0.5;
const CRUCE = 220; // debe coincidir con las animaciones `tab-panel-*` del CSS

function naceSobreControl(objetivo) {
  return !(objetivo instanceof Element) || Boolean(objetivo.closest(CONTROL));
}

function sinMovimiento() {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

/* El cruce tiene que ocurrir en el mismo cuadro que el cambio de pestaña: por eso
   se usa un efecto de disposición (y `useEffect` en el servidor, donde no hay DOM). */
const useEfectoAntesDePintar = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function TabSwipePanel({
  tabs,
  value,
  onChange,
  renderPanel,
  idBase,
  panelId,
  pista = null,
  className = "",
  activarGesto = true
}) {
  const [direccion, setDireccion] = useState("forward");
  const [saliendo, setSaliendo] = useState(null);
  const [animando, setAnimando] = useState(false);
  const [arrastre, setArrastre] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);

  const gesto = useRef(null);
  const timerSalida = useRef(null);
  const timerArrastre = useRef(null);
  const suprimirClick = useRef(false);

  useEffect(
    () => () => {
      if (timerSalida.current) window.clearTimeout(timerSalida.current);
      if (timerArrastre.current) window.clearTimeout(timerArrastre.current);
    },
    []
  );

  /** Cambia de panel (lo llaman las pestañas, el teclado y el gesto). */
  const seleccionar = useCallback(
    (siguiente) => {
      if (!tabs.some((t) => t.value === siguiente) || siguiente === value) return;
      onChange(siguiente);
    },
    [onChange, tabs, value]
  );

  /* Un único lugar decide el cruce, venga el cambio de la pestaña, del teclado o
     del gesto: así los tres caminos se ven exactamente igual. */
  const anterior = useRef(value);
  useEfectoAntesDePintar(() => {
    if (anterior.current === value) return undefined;
    const previo = anterior.current;
    anterior.current = value;

    const origen = tabs.findIndex((t) => t.value === previo);
    const destino = tabs.findIndex((t) => t.value === value);
    if (timerSalida.current) window.clearTimeout(timerSalida.current);

    setDireccion(destino >= origen ? "forward" : "backward");
    setSaliendo(previo); // el panel que se va se dibuja encima y se desvanece
    setArrastre(null);
    setArrastrando(false);

    if (sinMovimiento()) {
      setSaliendo(null);
      setAnimando(false);
      return undefined;
    }

    setAnimando(true);
    timerSalida.current = window.setTimeout(() => {
      setSaliendo(null);
      setAnimando(false); // libera el `transform` para el próximo arrastre
      timerSalida.current = null;
    }, CRUCE);
    return undefined;
  }, [tabs, value]);

  /* ── gesto ──────────────────────────────────────────────────────────── */

  function limpiarGesto() {
    gesto.current = null;
    setArrastrando(false);
    if (timerArrastre.current) window.clearTimeout(timerArrastre.current);
  }

  function handlePointerDown(evento) {
    if (!activarGesto || evento.pointerType === "mouse" && evento.button !== 0) return;
    if (naceSobreControl(evento.target)) return;

    gesto.current = {
      x: evento.clientX,
      y: evento.clientY,
      t: Date.now(),
      pointerId: evento.pointerId,
      horizontal: false,
      cancelado: false
    };
  }

  function handlePointerMove(evento) {
    const actual = gesto.current;
    if (!actual || actual.pointerId !== evento.pointerId || actual.cancelado) return;

    const dx = evento.clientX - actual.x;
    const dy = evento.clientY - actual.y;

    if (!actual.horizontal) {
      const lateral = Math.abs(dx);
      const vertical = Math.abs(dy);
      if (lateral < 8 && vertical < 8) return;
      if (lateral <= vertical * PROPORCION) {
        // El gesto va más vertical que horizontal: es scroll, no cambiamos de panel.
        if (vertical > 14) actual.cancelado = true;
        return;
      }
      actual.horizontal = true;
      if (!sinMovimiento()) setArrastrando(true);
    }

    const amortiguado = Math.max(-TOPE, Math.min(TOPE, dx * AMORTIGUAR));
    setArrastre(sinMovimiento() ? null : amortiguado);
  }

  function handlePointerUp(evento) {
    const actual = gesto.current;
    if (!actual || actual.pointerId !== evento.pointerId) return;

    const dx = evento.clientX - actual.x;
    const dy = evento.clientY - actual.y;
    const transcurrido = Math.max(1, Date.now() - actual.t);
    const lateral = Math.abs(dx);
    const fueRapido = lateral / transcurrido >= VELOCIDAD;
    const completo = actual.horizontal && lateral >= RECORRIDO;
    const completoRapido = actual.horizontal && lateral >= RECORRIDO_RAPIDO && fueRapido;
    const cancelado = actual.cancelado || lateral <= Math.abs(dy) * PROPORCION;

    limpiarGesto();

    if (completo || completoRapido) {
      const indice = tabs.findIndex((t) => t.value === value);
      const siguiente = tabs[indice + (dx < 0 ? 1 : -1)];
      suprimirClick.current = true;
      window.setTimeout(() => {
        suprimirClick.current = false;
      }, 500);
      if (siguiente) seleccionar(siguiente.value);
      return;
    }

    if (cancelado || arrastre == null) {
      setArrastre(null);
      return;
    }

    // No llegó: el panel regresa solo.
    setArrastre(0);
    timerArrastre.current = window.setTimeout(() => {
      setArrastre(null);
      timerArrastre.current = null;
    }, CRUCE);
  }

  function handleClickCapture(evento) {
    if (suprimirClick.current && evento.detail !== 0) {
      evento.preventDefault();
      evento.stopPropagation();
      suprimirClick.current = false;
    }
  }

  function handleKeyDown(evento) {
    if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;
    const indice = tabs.findIndex((t) => t.value === value);
    const siguiente = tabs[indice + (evento.key === "ArrowRight" ? 1 : -1)];
    if (!siguiente) return;
    evento.preventDefault();
    seleccionar(siguiente.value);
    // El foco viaja con la selección, como en un `tablist` bien hecho.
    document.getElementById(`${idBase}-tab-${siguiente.value}`)?.focus();
  }

  const estiloArrastre =
    arrastre == null
      ? undefined
      : { transform: `translateX(${arrastre}px)`, transition: arrastrando ? "none" : undefined };

  return (
    <>
      {pista && (
        <p className="swipe-hint" aria-hidden="true">
          {pista}
        </p>
      )}
      <div className={`tab-panels ${className}`.trim()}>
        <section
          key={value}
          className="tab-panel"
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${idBase}-tab-${value}`}
          tabIndex={0}
          data-direction={animando ? direccion : undefined}
          data-arrastrando={arrastrando ? "si" : undefined}
          style={estiloArrastre}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={limpiarGesto}
          onClickCapture={handleClickCapture}
          onKeyDown={handleKeyDown}
        >
          {renderPanel(value)}
        </section>

        {saliendo && (
          <div
            className="tab-panel tab-panel-exit"
            aria-hidden="true"
            inert
            data-direction={direccion}
          >
            {renderPanel(saliendo)}
          </div>
        )}
      </div>
    </>
  );
}
