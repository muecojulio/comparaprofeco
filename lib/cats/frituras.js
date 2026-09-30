export const cat_frituras = {
  id: "frituras",
  ramo: "alimentos",
  nombre: "Papas y frituras",
  emoji: "🍟",
  color: "#c2410c",
  mes: "Junio",
  anio: 2026,
  analizados: 67,
  pruebas: 3421,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1080239/RC592_Estudio_Frituras.pdf",
  fuente: "https://www.eleconomista.com.mx/bistronomie/compras-papas-bolsa-esto-encontro-profeco-sobre-grasa-sodio-proteina-20260626-820371.html",
  resumen: "Todos cumplieron contenido neto. 13 tenían más grasa, 7 más sodio y 10 menos proteína.",
  productos: [
    { id: "frituras-ok", marca: "Varias marcas", nombre: "Productos que sí coincidieron con la etiqueta", nivel: "aceptable", cumple: true, hallazgo: "El PDF lista quién sí coincidió." },
    { id: "gv-tiritas", marca: "Great Value", nombre: "Tiritas sabor queso", nivel: "incumple", cumple: false, hallazgo: "Sodio declarado 360 mg/100 g; laboratorio 1,003 mg." },
    { id: "gv-fuego", marca: "Great Value", nombre: "Chicharrones Fuego", nivel: "incumple", cumple: false, hallazgo: "Sodio declarado 1,300 mg; laboratorio 2,828 mg." },
    { id: "gv-jalapeno", marca: "Great Value", nombre: "Papas jalapeño crujientes", nivel: "incumple", cumple: false, hallazgo: "Más sodio y más grasa de lo declarado." },
    { id: "bokados", marca: "Bokados", nombre: "Boka-Chitos", nivel: "incumple", cumple: false, hallazgo: "Más grasa: 26 g vs 36.4 g / 100 g." },
    { id: "takis", marca: "Takis", nombre: "Chile Limón", nivel: "incumple", cumple: false, hallazgo: "Grasa declarada 29.5 g; laboratorio 35.9 g." }
  ]
};
