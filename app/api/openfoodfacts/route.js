import { NextResponse } from "next/server";
import { cached } from "../../../lib/cache";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ error: "q requerido" }, { status: 400 });
  }
  try {
    const payload = await cached(`off:${q.toLowerCase()}`, 30 * 60 * 1000, async () => {
      const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
      url.searchParams.set("search_terms", q);
      url.searchParams.set("search_simple", "1");
      url.searchParams.set("action", "process");
      url.searchParams.set("json", "1");
      url.searchParams.set("page_size", "5");
      url.searchParams.set("cc", "mx");
      const res = await fetch(url, {
        headers: { "User-Agent": "comparaprofeco/1.2 (contacto local)" },
        next: { revalidate: 1800 }
      });
      if (!res.ok) throw new Error(`off ${res.status}`);
      const json = await res.json();
      const products = Array.isArray(json.products) ? json.products : [];
      return {
        fuente: "https://world.openfoodfacts.org",
        q,
        productos: products.map((p) => ({
          code: p.code ?? null,
          product_name: p.product_name ?? null,
          brands: p.brands ?? null,
          quantity: p.quantity ?? null,
          url: p.code ? `https://world.openfoodfacts.org/product/${p.code}` : null
        }))
      };
    });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: "Open Food Facts no disponible", detalle: String(err.message || err) },
      { status: 502 }
    );
  }
}
