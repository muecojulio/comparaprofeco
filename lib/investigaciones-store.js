"use client";

/**
 * lib/investigaciones-store.js
 * ---------------------------------------------------------------------------
 * Guarda en el dispositivo las investigaciones de precios que la app descarga,
 * para que sigan ahí aunque cambie el mes, se cierre la app o no haya internet.
 *
 * Usa IndexedDB (aguanta resúmenes de ~1 MB) con respaldo en localStorage
 * (por si el navegador lo bloquea en modo privado).
 *
 * Nada se manda a ningún servidor: todo vive en el navegador de quien usa la app.
 */

const DB = "comparaprofeco";
const TIENDA = "investigaciones";
const CLAVE = "snapshot";
const LS_SNAPSHOT = "cp:precios";
const LS_META = "cp:precios-meta";

/* ── IndexedDB ── */

function abrirDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB no disponible"));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TIENDA)) db.createObjectStore(TIENDA);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(valor) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readwrite");
    tx.objectStore(TIENDA).put(valor, CLAVE);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet() {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readonly");
    const req = tx.objectStore(TIENDA).get(CLAVE);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/* ── API pública ── */

export async function guardarInvestigaciones(snapshot) {
  try {
    await idbPut(snapshot);
    return "indexeddb";
  } catch {
    try {
      localStorage.setItem(LS_SNAPSHOT, JSON.stringify(snapshot));
      return "localstorage";
    } catch {
      return null;
    }
  }
}

export async function leerInvestigaciones() {
  try {
    const s = await idbGet();
    if (s) return s;
  } catch {
    /* sigue con localStorage */
  }
  try {
    const crudo = localStorage.getItem(LS_SNAPSHOT);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export async function borrarInvestigaciones() {
  try {
    const db = await abrirDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(TIENDA, "readwrite");
      tx.objectStore(TIENDA).delete(CLAVE);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
  try { localStorage.removeItem(LS_SNAPSHOT); } catch {}
}

export function leerMeta() {
  try {
    const crudo = localStorage.getItem(LS_META);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export function guardarMeta(parcial) {
  const nueva = { ...(leerMeta() || {}), ...parcial };
  try { localStorage.setItem(LS_META, JSON.stringify(nueva)); } catch {}
  return nueva;
}

/** ¿Toca revisar el portal otra vez? (una vez al día por defecto) */
export function tocaRevisar(intervaloMs = 24 * 60 * 60 * 1000) {
  const meta = leerMeta();
  return !meta?.ultimaRevision || Date.now() - meta.ultimaRevision > intervaloMs;
}

/** Fecha en español, corta. */
export function fechaBonita(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`);
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return String(iso);
  }
}

export function miles(n) {
  return Number(n || 0).toLocaleString("es-MX");
}
