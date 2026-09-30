import { categorias, ramos } from "./data";

/**
 * Índices en memoria. No hay motor SQL: el catálogo es estático.
 * Conviene indexar id, ramo y año para filtros O(1)/O(k).
 */
export const byId = new Map(categorias.map((c) => [c.id, c]));

export const byRamo = new Map();
export const byAnio = new Map();
export const pdfsPorAnio = new Map();

for (const c of categorias) {
  if (!byRamo.has(c.ramo)) byRamo.set(c.ramo, []);
  byRamo.get(c.ramo).push(c);

  const y = Number(c.anio) || 0;
  if (!byAnio.has(y)) byAnio.set(y, []);
  byAnio.get(y).push(c);

  if (c.pdf) {
    if (!pdfsPorAnio.has(y)) pdfsPorAnio.set(y, []);
    pdfsPorAnio.get(y).push({
      id: c.id,
      nombre: c.nombre,
      ramo: c.ramo,
      mes: c.mes,
      anio: c.anio,
      pdf: c.pdf,
      fuente: c.fuente
    });
  }
}

export const ANIOS = [2024, 2025, 2026];

export function filtrarCatalogo(ramoId = "todos", anio = "todos") {
  let list =
    !ramoId || ramoId === "todos"
      ? categorias
      : byRamo.get(ramoId) || [];
  if (anio && anio !== "todos") {
    const y = Number(anio);
    list = list.filter((c) => Number(c.anio) === y);
  }
  return list;
}

export function pdfsFiltrados(ramoId = "todos", anio = "todos") {
  return filtrarCatalogo(ramoId, anio)
    .filter((c) => c.pdf)
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      ramo: c.ramo,
      ramoNombre: ramos.find((r) => r.id === c.ramo)?.nombre || c.ramo,
      mes: c.mes,
      anio: c.anio,
      pdf: c.pdf,
      fuente: c.fuente,
      emoji: c.emoji
    }));
}

export const stats = {
  categorias: categorias.length,
  ramos: ramos.length,
  productos: categorias.reduce((n, c) => n + (c.productos?.length || 0), 0),
  anios: ANIOS,
  indexed: true
};
