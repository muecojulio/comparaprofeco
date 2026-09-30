import { NextResponse } from "next/server";
import { cached } from "../../../lib/cache";

const CKAN = "https://datos.gob.mx/busca/api/3/action/package_search";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "profeco";
  const rows = Math.min(Number(searchParams.get("rows") || 8), 20);

  try {
    const payload = await cached(`ckan:${q}:${rows}`, 15 * 60 * 1000, async () => {
      const url = new URL(CKAN);
      url.searchParams.set("q", q);
      url.searchParams.set("rows", String(rows));
      const res = await fetch(url, {
        headers: { "User-Agent": "comparaprofeco/1.2" },
        next: { revalidate: 900 }
      });
      if (!res.ok) throw new Error(`ckan ${res.status}`);
      const json = await res.json();
      const results = json?.result?.results;
      if (!Array.isArray(results)) throw new Error("estructura inesperada");
      return {
        fuente: CKAN,
        q,
        count: json.result.count ?? results.length,
        datasets: results.map((d) => ({
          name: d.name ?? null,
          title: d.title ?? null,
          notes: d.notes ?? null,
          organization: d.organization?.title ?? null,
          url: d.name ? `https://datos.gob.mx/busca/dataset/${d.name}` : null
        }))
      };
    });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo leer datos.gob.mx", detalle: String(err.message || err) },
      { status: 502 }
    );
  }
}
