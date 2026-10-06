#!/usr/bin/env node
/**
 * scripts/build-snapshot.mjs
 * ---------------------------------------------------------------------------
 * Genera el resumen de investigaciones de PROFECO y lo deja como archivo
 * estático en public/data/profeco-latest.json (lo sirve el CDN de Vercel).
 *
 *   node scripts/build-snapshot.mjs                # 20,000 registros
 *   node scripts/build-snapshot.mjs --max 40000    # más cobertura, más peso
 *   node scripts/build-snapshot.mjs --desde carpeta   # sin red: agrega archivos locales
 *
 * Se ejecuta:
 *  · a mano cuando quieras,
 *  · en `npm run build` (script "prebuild"),
 *  · y en el GitHub Action diario que actualiza el archivo cuando PROFECO publica.
 *
 * Nunca rompe la app: si el portal falla y ya existe un archivo previo, avisa y
 * conserva el anterior (sale con código 0).
 * ---------------------------------------------------------------------------
 */
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  crearCliente, construirSnapshot, agregar, hashSnapshot, extraerJSON, parseCSV
} from "../lib/profeco.mjs";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (nombre, def) => {
  const i = args.indexOf(`--${nombre}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const SALIDA = resolve(raiz, opt("salida", "public/data/profeco-latest.json"));
const MAX = Number(opt("max", 20000));
const PAGINA = Number(opt("pagina", 5000));
const DESDE = opt("desde", null);

const log = (...a) => console.log("[profeco]", ...a);

/** Modo sin red: agrega respuestas de datastore ya descargadas (.json/.txt/.csv). */
async function snapshotDesdeArchivos(carpeta) {
  const archivos = (await readdir(carpeta)).filter((f) => /\.(json|txt|csv)$/i.test(f)).sort();
  if (!archivos.length) throw new Error(`No hay archivos .json/.txt/.csv en ${carpeta}`);
  let registros = [];
  for (const f of archivos) {
    const texto = await readFile(resolve(carpeta, f), "utf8");
    let filas = [];
    try {
      if (f.toLowerCase().endsWith(".csv")) filas = parseCSV(texto);
      else {
        const json = extraerJSON(texto);
        const r = json.result || json;
        filas = Array.isArray(r.records) ? r.records : Array.isArray(r) ? r : [];
      }
    } catch { filas = []; }
    log(`${f}: ${filas.length} registros`);
    registros = registros.concat(filas);
  }
  const datos = agregar(registros);
  return {
    schema: 1,
    version: await hashSnapshot({ archivos, registros: registros.length, actualizado: datos.actualizado }),
    fuente: {
      portal: "datos.gob.mx · Plataforma Nacional de Datos Abiertos (CKAN)",
      programa: "Quién es quién en los precios",
      dataset: "(desde archivos locales)",
      periodo: "(local)",
      publicadoEn: null,
      recursos: archivos.map((f) => ({ nombre: f, url: null, actualizado: null })),
      licencia: "CC-BY-4.0"
    },
    cobertura: {
      registrosProcesados: registros.length,
      precioMin: datos.preciosGlobales.min,
      precioMax: datos.preciosGlobales.max,
      precioMediana: datos.preciosGlobales.mediana,
      registrosDescartados: datos.descartados
    },
    actualizado: datos.actualizado,
    porCategoria: datos.porCategoria,
    porCadena: datos.porCadena.slice(0, 40),
    porEstado: datos.porEstado.slice(0, 40),
    productos: datos.porProducto.slice(0, 800)
  };
}

async function existeArchivo(ruta) {
  try { await readFile(ruta, "utf8"); return true; } catch { return false; }
}

const t0 = Date.now();
try {
  const cliente = crearCliente({ log });
  const snapshot = DESDE
    ? await snapshotDesdeArchivos(DESDE)
    : await construirSnapshot(cliente, {
        maxRegistros: MAX,
        tamPagina: PAGINA,
        onProgreso: ({ fase, descargados, meta, mensaje }) => {
          if (fase === "descargando") log(`descargando… ${descargados}/${meta}`);
          else if (mensaje) log(mensaje);
        }
      });

  await mkdir(dirname(SALIDA), { recursive: true });
  await writeFile(SALIDA, JSON.stringify(snapshot, null, 2), "utf8");
  const kb = Math.round(JSON.stringify(snapshot).length / 1024);
  log(`OK → ${SALIDA.replace(raiz + "/", "")} (${kb} KB) en ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  log(`   periodo ${snapshot.fuente.periodo} · publicado ${snapshot.fuente.publicadoEn} · datos al ${snapshot.actualizado}`);
  log(`   ${snapshot.cobertura.registrosProcesados.toLocaleString("es-MX")} registros · ${snapshot.porCategoria.length} categorías · ${snapshot.porCadena.length} cadenas · ${snapshot.productos.length} productos`);
} catch (e) {
  const hayPrevio = await existeArchivo(SALIDA);
  if (hayPrevio) {
    log(`⚠ El portal no respondió (${e.message}).`);
    log("  Se conserva el archivo anterior: la app sigue funcionando con esas investigaciones.");
    process.exit(0);
  }
  log(`✘ No se pudo generar y no había archivo previo: ${e.message}`);
  process.exit(1);
}
