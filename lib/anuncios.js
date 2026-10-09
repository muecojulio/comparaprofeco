"use client";

/**
 * Avisos breves (toast) para acusar recibo de una acción y, si se puede, ofrecer
 * "Deshacer". Se apoya en un evento de ventana: cualquier módulo puede llamar a
 * `anunciar()` sin conocer la interfaz que los dibuja (`app/components/Avisos.js`),
 * igual que ya hace `lib/analizados.js` con `EVENTO_ANALIZADOS`.
 */

export const EVENTO_AVISO = "cp-aviso";

let contador = 0;

/**
 * @param {object} aviso
 * @param {string} aviso.texto        Texto para leerse y mostrarse (obligatorio).
 * @param {"info"|"exito"|"error"} [aviso.tono]
 * @param {Function} [aviso.onAccion] Acción del botón secundario (p. ej. Deshacer).
 * @param {string} [aviso.etiquetaAccion]
 * @param {number} [aviso.duracion]   Milisegundos antes de autocerrarse (0 = no se cierra).
 */
export function anunciar({
  texto,
  tono = "info",
  onAccion,
  etiquetaAccion,
  duracion = 6000
} = {}) {
  if (!texto || typeof window === "undefined") return null;

  const detalle = {
    id: `aviso-${++contador}`,
    texto,
    tono,
    onAccion,
    etiquetaAccion: etiquetaAccion || (onAccion ? "Deshacer" : null),
    duracion
  };

  try {
    window.dispatchEvent(new CustomEvent(EVENTO_AVISO, { detail: detalle }));
  } catch {
    return null;
  }

  return detalle.id;
}

