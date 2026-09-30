export const cat_cremas = {
  id: "cremas", ramo: "higiene", nombre: "Cremas corporales", emoji: "🧖", color: "#c2410c", mes: "Diciembre", anio: 2024, analizados: 47, pruebas: null,
  pdf: "https://revistadelconsumidor.profeco.gob.mx/",
  fuente: "https://elpais.com/mexico/2024-12-03/la-profeco-alerta-sobre-las-cremas-corporales-que-no-humectan-o-no-comprueban-lo-que-venden.html",
  resumen: "47 cremas. Ninguna irritó. Varias traían menos producto y frases sin respaldo.",
  productos: [
    { id: "crema-ok", marca: "Cremas que sí humectaron", nombre: "Mayoría del estudio", nivel: "aceptable", cumple: true, hallazgo: "Revisa el PDF para tu marca de diario." },
    { id: "bioscents", marca: "Bio Scents", nombre: "Crema para piel normal", nivel: "incumple", cumple: false, hallazgo: "Declara 220 ml y contiene 205.4 ml." },
    { id: "kuxtal", marca: "Kuxtal Herbolaria Moderna", nombre: "480 g declarados", nivel: "incumple", cumple: false, hallazgo: "Contiene 459.2 g. Leyendas no comprobadas." },
    { id: "ylux", marca: "Ylux", nombre: "Coco, lavanda y mandarina", nivel: "incumple", cumple: false, hallazgo: "Menos gramos y frases sin prueba." },
    { id: "bodycology", marca: "Bodycology / Grisi / Hinds", nombre: "Humectación baja", nivel: "observado", cumple: true, hallazgo: "Humectación por debajo del promedio del estudio." }
  ]
};
