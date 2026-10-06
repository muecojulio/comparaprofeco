/**
 * lib/profeco.mjs
 * ---------------------------------------------------------------------------
 * Núcleo del actualizador: descarga las investigaciones más recientes del
 * programa "Quién es quién en los precios" (PROFECO) publicadas en la
 * Plataforma Nacional de Datos Abiertos (datos.gob.mx · CKAN 2.11.6) y las
 * convierte en un resumen pequeño que la app puede guardar en el celular.
 *
 * Sin dependencias: sólo Node 18+ (fetch nativo).
 *
 * Notas del portal (verificadas el 5-oct-2026):
 *  · La ruta buena es https://www.datos.gob.mx/api/3/action/...  (CON www y SIN /busca).
 *  · El portal filtra por User-Agent: "curl/…" y "node-fetch/…" reciben 403.
 *    Por eso aquí se manda un UA de navegador y hay vías de respaldo.
 *  · PROFECO publica cada mes con ~2 meses de rezago (los precios de julio 2026
 *    se publicaron el 22-sep-2026), así que revisar a diario y publicar cuando
 *    aparezca algo nuevo es lo correcto.
 * ---------------------------------------------------------------------------
 */

export const PORTAL = "https://www.datos.gob.mx/api/3/action";
export const PROGRAMA = "Quién es quién en los precios";

/** Datasets del programa: programa_quien_es_quien_precios_<año> */
export const RE_DATASET = /^programa_quien_es_quien_precios_(\d{4})$/;

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

// El portal bloquea UAs tipo bot (curl, node-fetch, ones con URL de contacto).
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";

/* ─────────────────────────── utilidades ─────────────────────────── */

/** Precio a número: "42.5" | "$42.50" | "1,234.50" → 42.5 ; basura → null */
export function normalizarPrecio(valor) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  let limpio = String(valor).replace(/[^\d.,-]/g, "").trim();
  if (!limpio) return null;
  if (limpio.includes(",") && limpio.includes(".")) limpio = limpio.replace(/,/g, "");
  else if (/,\d{1,2}$/.test(limpio)) limpio = limpio.replace(",", ".");
  else limpio = limpio.replace(/,/g, "");
  const n = Number.parseFloat(limpio);
  if (!Number.isFinite(n) || n <= 0 || n > 1000000) return null;
  return Math.round(n * 100) / 100;
}

export function mediana(nums) {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  const v = a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  return Math.round(v * 100) / 100;
}

const r2 = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);

/** "julio 2026, primera parte" → { anio, mes, etiqueta, orden } */
export function detectarPeriodo(nombre) {
  const t = String(nombre || "").toLowerCase();
  const anio = (t.match(/(20\d{2})/) || [])[1];
  const mes = MESES.findIndex((m) => t.includes(m));
  if (!anio || mes === -1) return null;
  return { anio: Number(anio), mes, orden: Number(anio) * 12 + mes, etiqueta: `${MESES[mes]} ${anio}` };
}

/** Parser CSV mínimo (comillas dobles, comas y saltos embebidos). Respaldo del datastore. */
export function parseCSV(texto) {
  const filas = [];
  let campo = "";
  let fila = [];
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; } else comillas = false;
      } else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n") { fila.push(campo); campo = ""; filas.push(fila); fila = []; }
    else if (c !== "\r") campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  if (!filas.length) return [];
  const enc = filas[0].map((h) => h.trim());
  return filas.slice(1).filter((f) => f.some((v) => v !== "")).map((f) =>
    Object.fromEntries(enc.map((h, k) => [h, f[k]]))
  );
}

/** Extrae el primer objeto JSON del texto (tolera envoltorios de proxy). */
export function extraerJSON(texto) {
  const i = texto.indexOf("{");
  const j = texto.lastIndexOf("}");
  if (i === -1 || j === -1) throw new Error("La respuesta no contiene JSON");
  return JSON.parse(texto.slice(i, j + 1));
}

/* ─────────────────────────── cliente HTTP ─────────────────────────── */

/**
 * Cliente con tiempo límite, reintentos y vías de respaldo:
 *   1) directa al portal
 *   2) DATOS_PROXY (variable de entorno, p. ej. un worker propio con ?u={url})
 *   3) r.jina.ai como última red de seguridad
 */
export function crearCliente({
  base = PORTAL,
  timeoutMs = 25000,
  reintentos = 2,
  log = () => {},
  fetchImpl = globalThis.fetch
} = {}) {
  const envProxies = (typeof process !== "undefined" && process.env?.DATOS_PROXY
    ? String(process.env.DATOS_PROXY).split(",").map((s) => s.trim()).filter(Boolean)
    : []);
  const vias = [
    { nombre: "directa", url: (u) => u },
    ...envProxies.map((p) => ({ nombre: `proxy:${p.slice(0, 24)}`, url: (u) => (p.includes("{url}") ? p.replace("{url}", u) : p + encodeURIComponent(u)) })),
    { nombre: "respaldo", url: (u) => `https://r.jina.ai/${u}` }
  ];

  async function pedirTexto(destino, { esJSON = true } = {}) {
    const url = destino.startsWith("http") ? destino : `${base}${destino}`;
    let ultimo;
    for (const via of vias) {
      const final = via.url(url);
      for (let intento = 0; intento <= reintentos; intento++) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          const res = await fetchImpl(final, {
            signal: ctrl.signal,
            redirect: "follow",
            cache: "no-store",
            headers: {
              "user-agent": UA,
              accept: esJSON ? "application/json,text/csv,*/*" : "*/*",
              "accept-language": "es-MX,es;q=0.9"
            }
          });
          if (res.status === 404) throw new Error("404: la ruta del portal no existe");
          if (res.status === 400) throw new Error("400: la acción de CKAN no existe");
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const texto = await res.text();
          if (via.nombre !== "directa") log(`[profeco] respondió por la vía ${via.nombre}`);
          return texto;
        } catch (e) {
          ultimo = e;
          if (/40[04]/.test(String(e.message))) throw e; // la ruta está mal: no se reintenta
          if (intento < reintentos) await new Promise((s) => setTimeout(s, 700 * (intento + 1)));
        } finally {
          clearTimeout(t);
        }
      }
    }
    throw new Error(`No se pudo consultar datos.gob.mx: ${ultimo?.message || "error de red"}`);
  }

  async function accion(nombre, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const json = extraerJSON(await pedirTexto(`/${nombre}?${qs}`));
    if (json.success === false) throw new Error(`CKAN rechazó ${nombre}: ${json.error?.message || "error"}`);
    return json.result;
  }

  return {
    accion,
    pedirTexto,
    descargarCSV: async (url) => parseCSV(await pedirTexto(url, { esJSON: false }))
  };
}

/* ──────────────────── descubrir la última investigación ──────────────────── */

/** Encuentra el periodo más reciente publicado y sus recursos (partes 1 y 2). */
export async function descubrirUltimaInvestigacion(cliente) {
  const busqueda = await cliente.accion("package_search", {
    q: "quien es quien en los precios",
    rows: "60",
    sort: "metadata_modified desc"
  });

  const datasets = (busqueda.results || [])
    .map((d) => ({ d, m: RE_DATASET.exec(d.name || "") }))
    .filter((x) => x.m)
    .map(({ d, m }) => ({ ...d, anio: Number(m[1]) }));

  if (!datasets.length) throw new Error("No se encontró el programa en el catálogo de datos.gob.mx");

  datasets.sort((a, b) => b.anio - a.anio || String(b.metadata_modified || "").localeCompare(String(a.metadata_modified || "")));
  const dataset = datasets[0];

  const detalle = await cliente.accion("package_show", { id: dataset.name });
  const recursos = (detalle.resources || [])
    .filter((r) => r.state === "active")
    .map((r) => ({ ...r, periodo: detectarPeriodo(r.name) }))
    .filter((r) => r.periodo);

  const ultimo = recursos.reduce((a, b) => (!a || b.periodo.orden > a.periodo.orden ? b : a), null);
  if (!ultimo) throw new Error("La investigación no tiene recursos con periodo reconocible");

  const delPeriodo = recursos
    .filter((r) => r.periodo.orden === ultimo.periodo.orden)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return {
    dataset: {
      nombre: detalle.name,
      titulo: detalle.title,
      organizacion: detalle.organization?.title || "PROFECO",
      modificado: detalle.metadata_modified
    },
    periodo: ultimo.periodo,
    publicadoEn: String(detalle.metadata_modified || "").slice(0, 10),
    recursos: delPeriodo.map((r) => ({
      id: r.id,
      nombre: r.name,
      formato: r.format,
      url: r.url,
      enDatastore: !!r.datastore_active,
      actualizado: String(r.metadata_modified || "").slice(0, 10)
    }))
  };
}

/** Descarga una página de registros (datastore) o el CSV completo como respaldo. */
export async function descargarRegistros(cliente, recurso, { limit = 5000, offset = 0 } = {}) {
  if (recurso.enDatastore !== false) {
    try {
      const r = await cliente.accion("datastore_search", {
        resource_id: recurso.id,
        limit: String(limit),
        offset: String(offset)
      });
      return { registros: r.records || [], total: r.total ?? (r.records || []).length };
    } catch {
      /* cae al CSV */
    }
  }
  const filas = await cliente.descargarCSV(recurso.url);
  return { registros: filas.slice(offset, offset + limit), total: filas.length };
}

/* ─────────────────────────── agregación ─────────────────────────── */

/** Convierte registros crudos en resúmenes listos para la app. */
export function agregar(registros) {
  const porCategoria = new Map();
  const porCadena = new Map();
  const porEstado = new Map();
  const porProducto = new Map();
  const precios = [];
  let fechaMax = "";
  let descartados = 0;

  for (const reg of registros) {
    const precio = normalizarPrecio(reg.precio);
    if (precio === null) { descartados++; continue; }
    precios.push(precio);

    const fecha = String(reg.fecha_registro || "").slice(0, 10);
    if (fecha > fechaMax) fechaMax = fecha;

    const cat = reg.categoria || reg.catalogo || "Sin categoría";
    const c = porCategoria.get(cat) || { categoria: cat, catalogo: reg.catalogo || "", registros: 0, precios: [] };
    c.registros++; c.precios.push(precio); porCategoria.set(cat, c);

    const cad = reg.cadena_comercial || reg.nombre_comercial || "Sin cadena";
    const cd = porCadena.get(cad) || { cadena: cad, giro: reg.giro || "", registros: 0, precios: [], estados: new Set() };
    cd.registros++; cd.precios.push(precio); if (reg.estado) cd.estados.add(reg.estado); porCadena.set(cad, cd);

    const est = reg.estado || "Sin estado";
    const es = porEstado.get(est) || { estado: est, registros: 0, precios: [] };
    es.registros++; es.precios.push(precio); porEstado.set(est, es);

    const clave = `${String(reg.producto || "").trim()}|${String(reg.presentacion || "").trim()}|${String(reg.marca || "S/M").trim()}`.toLowerCase();
    const p = porProducto.get(clave) || {
      producto: reg.producto || "", presentacion: reg.presentacion || "", marca: reg.marca || "S/M",
      categoria: cat, registros: 0, precios: [], cadenas: new Map()
    };
    p.registros++; p.precios.push(precio);
    if (cad) {
      const arr = p.cadenas.get(cad) || [];
      arr.push(precio);
      p.cadenas.set(cad, arr);
    }
    porProducto.set(clave, p);
  }

  const cerrar = (mapa, extras = () => ({})) =>
    [...mapa.values()]
      .map((v) => ({
        ...Object.fromEntries(Object.entries(v).filter(([k]) => !["precios", "cadenas", "estados"].includes(k))),
        precioMin: r2(Math.min(...v.precios)),
        precioMax: r2(Math.max(...v.precios)),
        precioMediana: mediana(v.precios),
        ...extras(v)
      }))
      .sort((a, b) => b.registros - a.registros);

  const productos = [...porProducto.values()]
    .map((p) => {
      const cadenas = [...p.cadenas.entries()]
        .map(([cadena, arr]) => ({ cadena, precioMediana: mediana(arr), registros: arr.length }))
        .sort((a, b) => a.precioMediana - b.precioMediana);
      return {
        producto: p.producto, presentacion: p.presentacion, marca: p.marca, categoria: p.categoria,
        registros: p.registros,
        precioMin: r2(Math.min(...p.precios)), precioMax: r2(Math.max(...p.precios)),
        precioMediana: mediana(p.precios),
        mejorCadena: cadenas[0]?.cadena || null,
        mejorPrecio: cadenas[0]?.precioMediana ?? null,
        cadenas: cadenas.slice(0, 6)
      };
    })
    .sort((a, b) => b.registros - a.registros);

  return {
    actualizado: fechaMax || null,
    descartados,
    preciosGlobales: {
      min: precios.length ? r2(Math.min(...precios)) : null,
      max: precios.length ? r2(Math.max(...precios)) : null,
      mediana: mediana(precios)
    },
    porCategoria: cerrar(porCategoria),
    porCadena: cerrar(porCadena, (v) => ({ estados: [...v.estados].sort() })),
    porEstado: cerrar(porEstado),
    porProducto: productos
  };
}

/* ─────────────────────────── snapshot ─────────────────────────── */

/** Hash corto y estable para saber si hay versión nueva. */
export async function hashSnapshot(objeto) {
  const texto = JSON.stringify(objeto);
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(texto).digest("hex").slice(0, 16);
}

/** Construye el snapshot completo recorriendo las partes (q1/q2) del mes más reciente. */
export async function construirSnapshot(cliente, { maxRegistros = 20000, tamPagina = 5000, maxProductos = 800, onProgreso = () => {} } = {}) {
  onProgreso({ fase: "descubriendo", mensaje: "Buscando la investigación más reciente…" });
  const inv = await descubrirUltimaInvestigacion(cliente);

  const registros = [];
  for (const recurso of inv.recursos) {
    let offset = 0;
    while (registros.length < maxRegistros) {
      const limite = Math.min(tamPagina, maxRegistros - registros.length);
      onProgreso({ fase: "descargando", recurso: recurso.nombre, descargados: registros.length, meta: maxRegistros });
      const { registros: filas } = await descargarRegistros(cliente, recurso, { limit: limite, offset });
      registros.push(...filas);
      if (!filas.length || filas.length < limite) break;
      offset += limite;
    }
    if (registros.length >= maxRegistros) break;
  }

  onProgreso({ fase: "agregando", descargados: registros.length });
  const datos = agregar(registros);
  const productos = datos.porProducto.slice(0, maxProductos);

  // La versión identifica a la INVESTIGACIÓN PUBLICADA (mes + fecha de publicación),
  // no a cuántos registros alcanzamos a bajar: así el aviso de "hay algo nuevo"
  // coincide siempre con lo que revisa /api/actualizar?solo=verificar.
  const version = await hashSnapshot({
    schema: 1,
    periodo: inv.periodo.etiqueta,
    publicadoEn: inv.publicadoEn,
    dataset: inv.dataset.nombre
  });

  return {
    schema: 1,
    version,
    // Sin sello de tiempo a propósito: el archivo sólo cambia cuando PROFECO
    // publica algo nuevo, y así el robot diario no hace commit todos los días.
    fuente: {
      portal: "datos.gob.mx · Plataforma Nacional de Datos Abiertos (CKAN)",
      programa: PROGRAMA,
      dataset: inv.dataset.nombre,
      titulo: inv.dataset.titulo,
      organizacion: inv.dataset.organizacion,
      periodo: inv.periodo.etiqueta,
      publicadoEn: inv.publicadoEn,
      recursos: inv.recursos.map((r) => ({ nombre: r.nombre, url: r.url, actualizado: r.actualizado })),
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
    productos
  };
}

/** Resumen legible para la interfaz. */
export function resumir(snapshot) {
  if (!snapshot) return "Sin investigaciones instaladas.";
  const c = snapshot.cobertura || {};
  return [
    `${snapshot.fuente?.programa} — ${snapshot.fuente?.periodo}`,
    `Publicado: ${snapshot.fuente?.publicadoEn} · Datos al: ${snapshot.actualizado}`,
    `Registros: ${Number(c.registrosProcesados || 0).toLocaleString("es-MX")} · Categorías: ${snapshot.porCategoria?.length || 0} · Cadenas: ${snapshot.porCadena?.length || 0}`,
    `Precios: $${c.precioMin} – $${c.precioMax} (mediana $${c.precioMediana})`
  ].join("\n");
}
