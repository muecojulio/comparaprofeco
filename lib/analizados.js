"use client";

/**
 * Analizados guardados ("producto analizado de hoy" que el usuario ya abrió).
 *
 * Los guarda en el propio dispositivo (localStorage) para que:
 *  · sigan ahí aunque cambie el día, el producto del día rote o se cierre la app;
 *  · aparezcan en su ramo (pestaña Ramos) y en su categoría (ficha del estudio);
 *  · funcionen sin internet y sin cuenta.
 *
 * No se manda nada a ningún servidor: vive sólo en el navegador.
 */

const KEY = "cp-analizados";
const TOPE = 40; // cuántos se conservan (más reciente primero)

/** Nombre del evento con el que se avisa a la interfaz que la lista cambió. */
export const EVENTO_ANALIZADOS = "cp-analizados";

function leerCrudo() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const lista = raw ? JSON.parse(raw) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function escribir(lista) {
  if (typeof window === "undefined") return lista;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lista));
  } catch {}
  try {
    window.dispatchEvent(new Event(EVENTO_ANALIZADOS));
  } catch {}
  return lista;
}

/** Identifica un analizado: la ficha concreta dentro de su estudio. */
export function claveDe(item) {
  const id = item?.producto?.id ?? item?.producto?.nombre ?? "";
  return `${item?.categoriaId ?? ""}|${id}`;
}

export function fechaTexto(iso) {
  if (!iso) return "";
  try {
    return new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return String(iso);
  }
}

export function leerAnalizados() {
  return leerCrudo();
}

/**
 * Guarda el analizado del día en su ramo y categoría. Devuelve la lista nueva.
 * Con `{ conservar: true }` se reinserta tal cual (lo usa "Deshacer" para no
 * cambiar la fecha en que se abrió).
 */
export function guardarAnalizado(item, { conservar = false } = {}) {
  if (!item?.categoriaId) return leerCrudo();

  if (conservar && item.abierto && item.producto) {
    const restaurada = { ...item, producto: { ...item.producto } };
    const clave = claveDe(restaurada);
    const otros = leerCrudo().filter((g) => claveDe(g) !== clave);
    return escribir([restaurada, ...otros].slice(0, TOPE));
  }

  const entrada = {
    abierto: new Date().toISOString().slice(0, 10), // cuándo lo abrió el usuario
    analizado: item.fecha ?? null,                  // fecha del "producto analizado del día"
    categoriaId: item.categoriaId,
    categoria: item.categoria ?? null,
    ramo: item.ramo ?? null,
    anio: item.anio ?? null,
    mes: item.mes ?? null,
    pdf: item.pdf ?? null,
    producto: {
      id: item.producto?.id ?? null,
      marca: item.producto?.marca ?? null,
      nombre: item.producto?.nombre ?? null,
      nivel: item.producto?.nivel ?? null,
      cumple: item.producto?.cumple ?? null,
      hallazgo: item.producto?.hallazgo ?? null
    }
  };
  const clave = claveDe(entrada);
  const otros = leerCrudo().filter((g) => claveDe(g) !== clave);
  return escribir([entrada, ...otros].slice(0, TOPE));
}

export function quitarAnalizado(clave) {
  return escribir(leerCrudo().filter((g) => claveDe(g) !== clave));
}

/** Consulta desde mapas indexados (categoría → analizados). */
export function porCategoria(lista) {
  const mapa = new Map();
  for (const g of lista) {
    if (!mapa.has(g.categoriaId)) mapa.set(g.categoriaId, []);
    mapa.get(g.categoriaId).push(g);
  }
  return mapa;
}
