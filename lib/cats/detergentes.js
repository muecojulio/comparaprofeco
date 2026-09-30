export const cat_detergentes = {
  id: "detergentes", ramo: "higiene", nombre: "Detergentes en polvo", emoji: "🧼", color: "#0369a1", mes: "Octubre", anio: 2025, analizados: 49, pruebas: null,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1025694/RC584_020-037-ESTUDIO-DETERGENTES.pdf",
  fuente: "https://www.masnoticias.mx/estudio-de-calidad-a-detergentes-publica-profeco/",
  resumen: "26 para ropa y 23 multiusos. Todos cumplieron contenido neto y pH.",
  productos: [
    { id: "ariel", marca: "Ariel / Ace / Bold / Foca", nombre: "Mejor antipercudido", nivel: "destacado", cumple: true, hallazgo: "Entre los mejores para que la ropa blanca no se ponga gris." },
    { id: "ace-frase", marca: "Ace Oxígeno Activo", nombre: "Frescura increíble", nivel: "observado", cumple: false, hallazgo: "No demostró esa leyenda." },
    { id: "persil-frase", marca: "Persil Colores Vivos", nombre: "Frescura duradera", nivel: "observado", cumple: false, hallazgo: "No demostró la frase." }
  ]
};
