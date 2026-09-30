import { extras } from "./extras";
import { coreA } from "./coreA";
import { coreB } from "./coreB";

export const APP = {
  name: "ComparaProfeco",
  tagline: "Estudios de la Revista del Consumidor, más claros",
  disclaimer:
    "Esta app resume estudios de calidad ya publicados por Profeco. No es un sitio oficial. Profeco suele evaluar modelos concretos, no “la mejor marca de México”. Siempre abre el PDF oficial antes de decidir."
};

export const ramos = [
  {
    id: "alimentos",
    nombre: "Alimentos y bebidas",
    emoji: "🛒",
    detalle: "Lácteos, embutidos, atún, aceites, chocolates, refrescos, fórmulas y alcohol."
  },
  {
    id: "tecnologia",
    nombre: "Tecnología y electrónica",
    emoji: "📺",
    detalle: "Pantallas LED, audífonos, licuadoras, barras de sonido, relojes y laptops."
  },
  {
    id: "hogar",
    nombre: "Hogar y construcción",
    emoji: "🏠",
    detalle: "Pinturas, impermeabilizantes, sartenes, almohadas y colchones."
  },
  {
    id: "higiene",
    nombre: "Higiene, aseo y cuidado",
    emoji: "🧴",
    detalle: "Detergentes, papel higiénico, toallas, jabones, champús y cremas."
  },
  {
    id: "ropa",
    nombre: "Ropa, calzado y textiles",
    emoji: "👕",
    detalle: "Mezclilla, playeras, uniformes, ropa interior, calzado escolar y sábanas."
  },
  {
    id: "escolares",
    nombre: "Útiles y temporada escolar",
    emoji: "📚",
    detalle: "Mochilas, cuadernos, pegamentos, lápices y tijeras de regreso a clases."
  }
];

export const NIVELES = {
  destacado: {
    label: "Mejor evaluación",
    short: "Mejor",
    hint: "Cumple y destaca en las pruebas publicadas"
  },
  aceptable: {
    label: "Aceptable",
    short: "Más o menos",
    hint: "Cumple lo revisado, sin ser el más destacado"
  },
  observado: {
    label: "Con observaciones",
    short: "Ojo",
    hint: "Hay diferencias o leyendas a revisar"
  },
  incumple: {
    label: "Incumple / no es lo que dice",
    short: "Peor",
    hint: "Profeco documentó incumplimiento o denominación incorrecta"
  }
};

export const categorias = [...coreA, ...coreB, ...extras];

export function getCategoria(id) {
  return categorias.find((c) => c.id === id);
}

export function getRamo(id) {
  return ramos.find((r) => r.id === id);
}

export function catsDelRamo(ramoId, anio = "todos") {
  let list = !ramoId || ramoId === "todos" ? categorias : categorias.filter((c) => c.ramo === ramoId);
  if (anio && anio !== "todos") {
    const y = Number(anio);
    list = list.filter((c) => Number(c.anio) === y);
  }
  return list;
}

export function buscar(texto) {
  const q = (texto || "").trim().toLowerCase();
  if (!q) return [];
  const hits = [];
  for (const cat of categorias) {
    if (cat.nombre.toLowerCase().includes(q)) {
      hits.push({ tipo: "categoria", cat });
    }
    for (const p of cat.productos) {
      const blob = `${p.marca} ${p.nombre} ${p.hallazgo}`.toLowerCase();
      if (blob.includes(q)) hits.push({ tipo: "producto", cat, p });
    }
  }
  return hits;
}

export function conteoNiveles(cat) {
  const c = { destacado: 0, aceptable: 0, observado: 0, incumple: 0 };
  for (const p of cat.productos) c[p.nivel] += 1;
  return c;
}
