import { NextResponse } from "next/server";
import { filtrarCatalogo, stats } from "../../../lib/indexes";
import { cached } from "../../../lib/cache";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ramo = searchParams.get("ramo") || "todos";
  const anio = searchParams.get("anio") || "todos";
  const data = cached(`cat:${ramo}:${anio}`, 5 * 60 * 1000, () => ({
    stats,
    ramo,
    anio,
    categorias: filtrarCatalogo(ramo, anio).map((c) => ({
      id: c.id,
      ramo: c.ramo,
      nombre: c.nombre,
      emoji: c.emoji,
      mes: c.mes,
      anio: c.anio,
      analizados: c.analizados,
      pdf: c.pdf,
      fuente: c.fuente,
      productos: c.productos
    }))
  }));
  return NextResponse.json(data);
}
