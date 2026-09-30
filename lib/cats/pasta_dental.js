export const cat_pasta_dental = {
  id: "pasta-dental",
  ramo: "higiene",
  nombre: "Pasta dental",
  emoji: "🪥",
  color: "#0f766e",
  mes: "Febrero",
  anio: 2026,
  analizados: 46,
  pruebas: 2251,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1054260/RC588_053-064-Estudio-Pasta-Dental.pdf",
  fuente: "https://www.gob.mx/profeco/prensa/para-sensibilidad-blanqueadoras-o-convencionales-profeco-analiza-pastas-dentales?idiom=es-MX",
  resumen: "Se analizaron 20 pastas convencionales, 10 para sensibilidad y 16 blanqueadoras. Todas las que declaran flúor cumplieron la concentración.",
  productos: [
    { id: "crest-escudo", marca: "Crest", nombre: "Escudo Anti-Azúcar", nivel: "destacado", cumple: true, hallazgo: "Opción convencional económica que cumplió pH y calidad en el estudio." },
    { id: "freska-ra", marca: "Freska-Ra", nombre: "5 en 1 Fortident", nivel: "destacado", cumple: true, hallazgo: "Pasta económica que cumplió el rango de pH (5.5 a 9.3) y lo declarado en etiqueta." },
    { id: "colgate", marca: "Colgate", nombre: "Pastas convencionales evaluadas", nivel: "aceptable", cumple: true, hallazgo: "Cumplió pruebas de flúor, pH e información revisada. Revisa el modelo exacto en el PDF." },
    { id: "oralb", marca: "Oral-B", nombre: "Pastas convencionales evaluadas", nivel: "aceptable", cumple: true, hallazgo: "Incluida en el grupo convencional que cumplió parámetros de laboratorio." },
    { id: "gum-ortho", marca: "GUM", nombre: "Ortho y SensiVital+", nivel: "incumple", cumple: false, hallazgo: "Información comercial incompleta: no ostentan importador ni leyenda en español del país de origen." },
    { id: "mitch", marca: "Mitch", nombre: "Pasta de clorofila para dientes sensibles", nivel: "incumple", cumple: false, hallazgo: "Hasta 10.9 % menos contenido neto del declarado." }
  ]
};
