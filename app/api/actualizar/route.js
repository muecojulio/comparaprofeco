import { NextResponse } from "next/server";
import { crearCliente, descubrirUltimaInvestigacion, construirSnapshot, resumir, hashSnapshot } from "../../../lib/profeco.mjs";

/**
 * /api/actualizar — investigaciones de precios de PROFECO (datos.gob.mx)
 * ---------------------------------------------------------------------------
 *  · ?solo=verificar&version=<hash>  → revisión barata: ¿ya publicaron algo nuevo?
 *  · ?armar=1&max=20000             → arma el resumen EN VIVO desde el portal
 *  · sin parámetros                 → devuelve el archivo del deploy
 *                                     (public/data/profeco-latest.json)
 *
 * Todo pasa por el servidor: el navegador no puede (ni debe) llamar al portal.
 * Si el portal falla, la app se queda con lo que ya tiene instalado.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cliente = crearCliente({ log: (...a) => console.log("[actualizar]", ...a) });

// Caché en memoria de la instancia (evita golpear el portal en cada visita)
const cache = new Map(); // clave → { valor, expira }
const TTL = 15 * 60 * 1000;

async function conCache(clave, fn, ttl = TTL) {
  const hit = cache.get(clave);
  if (hit && hit.expira > Date.now()) return { ...hit.valor, enCache: true };
  const valor = await fn();
  cache.set(clave, { valor, expira: Date.now() + ttl });
  return { ...valor, enCache: false };
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const versionInstalada = searchParams.get("version") || "";
  const max = Math.min(Math.max(Number(searchParams.get("max") || 20000), 1000), 40000);
  const cabeceras = { "cache-control": "no-store" };

  try {
    /* 1) Revisión barata: sólo consulta el catálogo (2 peticiones al portal) */
    if (searchParams.get("solo") === "verificar") {
      const r = await conCache("verificar", async () => {
        const inv = await descubrirUltimaInvestigacion(cliente);
        // Misma firma que usa construirSnapshot(): así el aviso coincide con el archivo.
        const version = await hashSnapshot({
          schema: 1,
          periodo: inv.periodo.etiqueta,
          publicadoEn: inv.publicadoEn,
          dataset: inv.dataset.nombre
        });
        return {
          ok: true,
          version,
          periodo: inv.periodo.etiqueta,
          publicadoEn: inv.publicadoEn,
          dataset: inv.dataset.nombre,
          recursos: inv.recursos.map((x) => x.nombre),
          consultadoEn: new Date().toISOString()
        };
      }, 10 * 60 * 1000);

      return NextResponse.json(
        { ...r, novedad: r.version !== versionInstalada },
        { headers: { ...cabeceras, "cache-control": "public, s-maxage=600, stale-while-revalidate=3600" } }
      );
    }

    /* 2) Armar en vivo el resumen del mes más reciente (lo pide el botón) */
    if (searchParams.get("armar") === "1") {
      const snapshot = await conCache(`snapshot:${max}`, async () => {
        const s = await construirSnapshot(cliente, { maxRegistros: max });
        return { ok: true, snapshot: s, resumen: resumir(s) };
      }, 6 * 60 * 60 * 1000);

      return NextResponse.json(
        { ...snapshot, novedad: snapshot.snapshot?.version !== versionInstalada },
        { headers: { ...cabeceras, "cache-control": "public, s-maxage=21600, stale-while-revalidate=86400" } }
      );
    }

    /* 3) Sin parámetros: entrega el archivo que dejó el último deploy */
    const res = await fetch(new URL("/data/profeco-latest.json", origin), { cache: "no-store" });
    if (!res.ok) throw new Error(`el archivo del deploy respondió ${res.status}`);
    const horneado = await res.json();
    return NextResponse.json(
      {
        ok: true,
        origen: "deploy",
        snapshot: horneado,
        resumen: resumir(horneado),
        novedad: horneado.version !== versionInstalada
      },
      { headers: { ...cabeceras, "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "El portal de datos abiertos no respondió",
        detalle: String(error?.message || error),
        sugerencia: "La app sigue con las investigaciones ya instaladas en el dispositivo."
      },
      { status: 502, headers: cabeceras }
    );
  }
}
