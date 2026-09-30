export const cat_mantequillas = {
  id: "mantequillas", ramo: "alimentos", nombre: "Mantequillas y margarinas", emoji: "🧈", color: "#ca8a04", mes: "Julio", anio: 2026, analizados: 43, pruebas: 2118,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1088144/RC593_041-058-ESTUDIO_MANTEQUILLAS-MARGARINAS.pdf",
  fuente: "https://www.gob.mx/profeco/prensa/pan-con-mantequilla-o-margarina-profeco-analiza-su-calidad-429678",
  resumen: "Todos cumplieron contenido neto. Dos no deberían usar el nombre por grasa insuficiente.",
  productos: [
    { id: "chipilo", marca: "Chipilo / Alpura / Carranco", nombre: "Mantequilla sin sal", nivel: "destacado", cumple: true, hallazgo: "Aprobaron pruebas; versión sin sal sin sellos." },
    { id: "kerrygold", marca: "Kerrygold / Lurpak / Président", nombre: "Mantequilla sin sal", nivel: "destacado", cumple: true, hallazgo: "Cumplen el estándar de mantequilla." },
    { id: "primavera", marca: "Primavera / Aurrera", nombre: "Margarina o untable", nivel: "aceptable", cumple: true, hallazgo: "Cumplen contenido; suelen llevar sellos de calorías." },
    { id: "lurpak-mezcla", marca: "Lurpak", nombre: "Mezcla 64 % mantequilla con canola", nivel: "observado", cumple: true, hallazgo: "No hay norma para esa mezcla. El nombre confunde." },
    { id: "gloria-light", marca: "Gloria", nombre: "Mantequilla reducida en grasa sin sal", nivel: "incumple", cumple: false, hallazgo: "60 g de grasa / 100 g; no alcanza el mínimo de mantequilla." },
    { id: "tablemaid", marca: "Table Maid", nombre: "Margarina con sal 90 g", nivel: "incumple", cumple: false, hallazgo: "No contiene el mínimo de grasa para llamarse margarina." }
  ]
};
