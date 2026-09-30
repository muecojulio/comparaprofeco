import { NextResponse } from "next/server";
import { productoDelDia } from "../../../lib/featured";
import { cached } from "../../../lib/cache";

export async function GET() {
  const data = cached("featured", 60 * 60 * 1000, () => ({
    publicado: true,
    origen: "catalogo-profeco-local",
    item: productoDelDia()
  }));
  return NextResponse.json(data);
}
