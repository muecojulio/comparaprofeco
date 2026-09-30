import { ALL_CATS } from "./catalog";

export const APP = {
  name: "ComparaProfeco",
  tagline: "Estudios de la Revista del Consumidor, más claros",
  disclaimer:
    "Esta app resume estudios de calidad ya publicados por Profeco. No es un sitio oficial. Profeco suele evaluar modelos concretos, no \u201cla mejor marca de M\u00e9xico\u201d. Siempre abre el PDF oficial antes de decidir."
};

export const ramos = [
  { id: "alimentos", nombre: "Alimentos y bebidas", emoji: "\ud83d\uded2", detalle: "L\u00e1cteos, embutidos, at\u00fan, aceites, chocolates, refrescos, f\u00f3rmulas y alcohol." },
  { id: "tecnologia", nombre: "Tecnolog\u00eda y electr\u00f3nica", emoji: "\ud83d\udcfa", detalle: "Pantallas LED, aud\u00edfonos, licuadoras, barras de sonido, relojes y laptops." },
  { id: "hogar", nombre: "Hogar y construcci\u00f3n", emoji: "\ud83c\udfe0", detalle: "Pinturas, impermeabilizantes, sartenes, almohadas y colchones." },
  { id: "higiene", nombre: "Higiene, aseo y cuidado", emoji: "\ud83e\uddf4", detalle: "Detergentes, papel higi\u00e9nico, toallas, jabones, champ\u00fas y cremas." },
  { id: "ropa", nombre: "Ropa, calzado y textiles", emoji: "\ud83d\udc55", detalle: "Mezclilla, playeras, uniformes, ropa interior, calzado escolar y s\u00e1banas." },
  { id: "escolares", nombre: "\u00datiles y temporada escolar", emoji: "\ud83d\udcda", detalle: "Mochilas, cuadernos, pegamentos, l\u00e1pices y tijeras de regreso a clases." }
];

export const NIVELES = {
  destacado: { label: "Mejor evaluaci\u00f3n", short: "Mejor", hint: "Cumple y destaca en las pruebas publicadas" },
  aceptable: { label: "Aceptable", short: "M\u00e1s o menos", hint: "Cumple lo revisado, sin ser el m\u00e1s destacado" },
  observado: { label: "Con observaciones", short: "Ojo", hint: "Hay diferencias o leyendas a revisar" },
  incumple: { label: "Incumple / no es lo que dice", short: "Peor", hint: "Profeco document\u00f3 incumplimiento o denominaci\u00f3n incorrecta" }
};

export const categorias = ALL_CATS;

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
    if (cat.nombre.toLowerCase().includes(q)) hits.push({ tipo: "categoria", cat });
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
