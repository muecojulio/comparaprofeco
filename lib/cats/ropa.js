export const cat_ropa = {
  id: "ropa", ramo: "ropa", nombre: "Playeras y ropa deportiva", emoji: "👕", color: "#115e59", mes: "Abril", anio: 2026, analizados: null, pruebas: null,
  pdf: "https://revistadelconsumidor.profeco.gob.mx/",
  fuente: "https://www.elimparcial.com/mexico/2026/08/22/profeco-analizo-marcas-de-ropa-y-concluye-que-shaq-simply-basic-y-wilson-son-las-marcas-mas-resistentes-y-de-mayor-calidad-mientras-que-nike-y-puma-obtuvieron-diferencias-en-la-composicion-de-sus-prendas/",
  resumen: "Roce, lavado y fibras. Shaq, Simply Basic y Wilson destacaron. Nike y Puma con diferencias de composición.",
  productos: [
    { id: "shaq", marca: "Shaq", nombre: "Modelo abril 2026", nivel: "destacado", cumple: true, hallazgo: "Entre los tres con mejor resistencia." },
    { id: "simply", marca: "Simply Basic", nombre: "Modelo evaluado", nivel: "destacado", cumple: true, hallazgo: "Alta resistencia al uso y al lavado." },
    { id: "wilson", marca: "Wilson", nombre: "Modelo evaluado", nivel: "destacado", cumple: true, hallazgo: "Tercero en la evaluación general." },
    { id: "nike-ropa", marca: "Nike", nombre: "Modelo con diferencia de fibras", nivel: "incumple", cumple: false, hallazgo: "La composición declarada no coincidió." },
    { id: "puma-ropa", marca: "Puma", nombre: "Modelo con diferencia de fibras", nivel: "incumple", cumple: false, hallazgo: "Diferencia entre fibras declaradas y encontradas." }
  ]
};
