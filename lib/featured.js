import { categorias } from "./data";

/** Productos con evaluación publicada (2024 en adelante). */
function poolDestacados() {
  const out = [];
  for (const cat of categorias) {
    if (Number(cat.anio) < 2024) continue;
    for (const p of cat.productos || []) {
      if (p.nivel === "destacado" || p.cumple) {
        out.push({ cat, p });
      }
    }
  }
  return out.length ? out : categorias.flatMap((cat) => (cat.productos || []).map((p) => ({ cat, p })));
}

export function productoDelDia(date = new Date()) {
  const pool = poolDestacados();
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86400000);
  const hit = pool[day % pool.length];
  return {
    fecha: date.toISOString().slice(0, 10),
    categoriaId: hit.cat.id,
    categoria: hit.cat.nombre,
    ramo: hit.cat.ramo,
    anio: hit.cat.anio,
    mes: hit.cat.mes,
    pdf: hit.cat.pdf,
    producto: hit.p
  };
}
