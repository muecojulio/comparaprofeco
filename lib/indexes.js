import { categorias, ramos } from "./data";

/**
 * Índices en memoria. No hay motor SQL: el catálogo es estático.
 * Hoy sólo se usa el índice por ramo; el resto se calcula al filtrar.
 */
const byRamo = new Map();

for (const c of categorias) {
  if (!byRamo.has(c.ramo)) byRamo.set(c.ramo, []);
  byRamo.get(c.ramo).push(c);
}

export const ANIOS = [2024, 2025, 2026];

function filtrarCatalogo(ramoId = "todos", anio = "todos") {
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
