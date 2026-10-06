"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EVENTO_AVISO } from "../../lib/anuncios";

/**
 * Avisos breves (toast) para acusar recibo de una acción y ofrecer "Deshacer".
 *
 * Accesibilidad:
 *   · el contenedor es la región viva (`role="status"`, `polite`), por lo que el
 *     texto se lee una sola vez y no interrumpe;
 *   · los avisos de error llevan `role="alert"`;
 *   · al pasar el puntero o al enfocar con el teclado, el autocierre se pausa;
 *   · todo se puede cerrar con un botón de 44 px.
 *
 * Se monta una sola vez en `Shell`, así que sobrevive a los cambios de página.
 */

const ICONO = { info: "ℹ", exito: "✓", error: "!" };

export default function Avisos() {
  const [lista, setLista] = useState([]);
  const listaRef = useRef([]); // fuente de verdad: los temporizadores la consultan
  const temporizadores = useRef(new Map()); // id → timeoutId
  const restante = useRef(new Map()); // id → ms que faltan
  const arranque = useRef(new Map()); // id → cuándo empezó a correr

  const publicar = useCallback((nueva) => {
    listaRef.current = nueva;
    setLista(nueva);
  }, []);

  const cerrar = useCallback(
    (id) => {
      const t = temporizadores.current.get(id);
      if (t) window.clearTimeout(t);
      temporizadores.current.delete(id);
      restante.current.delete(id);
      arranque.current.delete(id);
      publicar(listaRef.current.filter((a) => a.id !== id));
    },
    [publicar]
  );

  const arrancar = useCallback(
    (id, ms) => {
      if (!ms) return;
      const anterior = temporizadores.current.get(id);
      if (anterior) window.clearTimeout(anterior);
      restante.current.set(id, ms);
      arranque.current.set(id, Date.now());
      temporizadores.current.set(
        id,
        window.setTimeout(() => cerrar(id), ms)
      );
    },
    [cerrar]
  );

  /** Pausa el autocierre (para que dé tiempo de leer o de tocar "Deshacer"). */
  const pausar = useCallback(() => {
    for (const [id, t] of temporizadores.current) {
      window.clearTimeout(t);
      temporizadores.current.delete(id);
      const quedaba = restante.current.get(id) ?? 0;
      const corrio = Date.now() - (arranque.current.get(id) ?? Date.now());
      restante.current.set(id, Math.max(600, quedaba - corrio));
    }
  }, []);

  const reanudar = useCallback(() => {
    for (const [id, ms] of restante.current) arrancar(id, ms);
  }, [arrancar]);

  useEffect(() => {
    function recibir(evento) {
      const aviso = evento.detail;
      if (!aviso?.texto) return;

      const actual = listaRef.current;
      const sobrantes = actual.slice(-1); // se conservan los 2 más recientes
      for (const viejo of actual) {
        if (!sobrantes.includes(viejo)) cerrar(viejo.id);
      }

      publicar([...sobrantes, aviso]);
      arrancar(aviso.id, aviso.duracion);
    }

    window.addEventListener(EVENTO_AVISO, recibir);
    return () => {
      window.removeEventListener(EVENTO_AVISO, recibir);
      for (const t of temporizadores.current.values()) window.clearTimeout(t);
      temporizadores.current.clear();
    };
  }, [arrancar, cerrar, publicar]);

  return (
    <div
      className="avisos"
      onPointerEnter={pausar}
      onPointerLeave={reanudar}
      onFocusCapture={pausar}
      onBlurCapture={reanudar}
    >
      <div className="avisos-lista" role="status" aria-live="polite" aria-atomic="false">
        {lista.map((aviso) => (
          <div
            className={`aviso aviso-${aviso.tono}`}
            key={aviso.id}
            role={aviso.tono === "error" ? "alert" : undefined}
          >
            <span className="aviso-icono" aria-hidden="true">
              {ICONO[aviso.tono] || ICONO.info}
            </span>
            <p className="aviso-texto">{aviso.texto}</p>
            {aviso.onAccion && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  try {
                    aviso.onAccion();
                  } finally {
                    cerrar(aviso.id);
                  }
                }}
              >
                {aviso.etiquetaAccion || "Deshacer"}
              </button>
            )}
            <button
              type="button"
              className="aviso-cerrar"
              onClick={() => cerrar(aviso.id)}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
