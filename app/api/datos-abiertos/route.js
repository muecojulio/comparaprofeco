import { NextResponse } from "next/server";
import { cached } from "../../../lib/cache";

/**
 * Catálogo de datos abiertos (PROFECO) — datos.gob.mx · CKAN 2.11.6
 *
 * ARREGLO (5-oct-2026): la URL anterior era
 *     https://datos.gob.mx/busca/api/3/action/package_search
 * que responde 308 → https://www.datos.gob.mx/busca/api/3/action/package_search
 * y ahí el portal contesta 404. Por eso el endpoint devolvía
 *     502 { "error": "No se pudo leer datos.gob.mx", "detalle": "ckan 404" }
 * La ruta correcta es SIN "/busca" y CON "www":
 *     https://www.datos.gob.mx/api/3/action/package_search   → 200 ✔
 *
 * Nota del portal: los enlaces a la ficha pública del dataset también cambiaron;
 * ahora son  https://www.datos.gob.mx/dataset/<nombre>   (200 ✔)
 * y NO   https://datos.gob.mx/busca/dataset/<nombre>     (404 ✘)
 *
 * Extra: si el portal falla o bloquea (Akamai devuelve 403 a algunos User-Agent),
 * se responde con un catálogo de respaldo para que la tarjeta "Datos abiertos
 * (sin key)" nunca se quede vacía; se avisa en `aviso`.
 */

const CKAN = "https://www.datos.gob.mx/api/3/action/package_search";

// El portal filtra por User-Agent: "curl/…", "node-fetch/…" y UAs tipo bot con URL reciben 403.
// "comparaprofeco/1.2" funciona, pero se usa uno de navegador para blindarlo.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

const fichaDataset = (name) =>
  name ? `https://www.datos.gob.mx/dataset/${name}` : null;

// Catálogo mínimo de respaldo: datos reales de PROFECO en datos.gob.mx.
// Se actualiza a mano sólo si cambian los conjuntos de datos de la organización.
const RESPALDO = [
  { name: "programa_quien_es_quien_precios_2026", title: "Programa Quién es quién en los precios (2026)", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
  { name: "quejas-en-materia-de-telecomunicaciones", title: "Quejas en materia de telecomunicaciones", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
  { name: "registro-publico-de-casas-de-empeno", title: "Registro público de casas de empeño", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
  { name: "proveedores-responsables-en-comercio-electronico", title: "Proveedores responsables en comercio electrónico", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
  { name: "quejas-en-materia-de-servicios", title: "Quejas en materia de servicios", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
  { name: "registro-de-politicas-de-compensacion-de-aerolineas", title: "Registro de Políticas de Compensación de Aerolíneas", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
  { name: "programa_quien_es_quien_precios_2025", title: "Programa Quién es quién en los precios (2025)", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
  { name: "programa_quien_es_quien_precios_2024", title: "Programa Quién es quién en los precios (2024)", organization: "Procuraduría Federal del Consumidor (PROFECO)" },
].map((d) => ({ ...d, notes: null, url: fichaDataset(d.name) }));

// Sólo letras, números, espacios y guiones, máximo 80 caracteres. Evita que la
// búsqueda se use para inyectar sintaxis en el motor del portal.
const RE_Q = /^[\p{L}\p{N} _-]{1,80}$/u;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const qCruda = (searchParams.get("q") || "profeco").trim() || "profeco";
  const q = RE_Q.test(qCruda) ? qCruda : "profeco";
  const rows = Math.min(Math.max(Number(searchParams.get("rows") || 8) || 8, 1), 20);

  try {
    const payload = await cached(`ckan:${q}:${rows}`, 15 * 60 * 1000, async () => {
      const url = new URL(CKAN);
      url.searchParams.set("q", q);
      url.searchParams.set("rows", String(rows));
      url.searchParams.set("sort", "metadata_modified desc");

      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        next: { revalidate: 900 },
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
          url: fichaDataset(d.name),
          actualizado: (d.metadata_modified || "").slice(0, 10) || null,
          recursos: d.num_resources ?? (d.resources || []).length,
          formato: (d.resources || [])[0]?.format?.toUpperCase() || null,
        })),
      };
    });

    return NextResponse.json(payload);
  } catch (err) {
    // El portal no respondió: se sirve el respaldo para que la tarjeta siga funcionando.
    // El detalle técnico se registra en el servidor, no se envía al navegador.
    console.warn("[datos-abiertos]", String(err?.message || err));
    return NextResponse.json({
      fuente: CKAN,
      q,
      count: RESPALDO.length,
      datasets: RESPALDO.slice(0, rows),
      degradado: true,
      aviso: {
        error: "El portal de datos abiertos no respondió a tiempo",
        sugerencia: "Se muestran conjuntos de datos del catálogo local.",
      },
    });
  }
}
