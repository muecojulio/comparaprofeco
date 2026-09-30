export const cat_yogur = {
  id: "yogur",
  ramo: "alimentos",
  nombre: "Yogur",
  emoji: "🥛",
  color: "#a16207",
  mes: "Enero",
  anio: 2026,
  analizados: 18,
  pruebas: 1884,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1054264/RC587_043-051-Estudio-Yogur__1_.pdf",
  fuente: "https://www.gob.mx/profeco/prensa/profeco-detecta-incumplimientos-en-tres-productos-que-se-denominan-yogur-417026?idiom=es",
  resumen: "Se revisó si el producto puede llamarse yogur (NOM-181). Tres presentaciones incumplieron.",
  productos: [
    { id: "lala-yogur", marca: "Lala", nombre: "Yogur natural / con endulzantes", nivel: "destacado", cumple: true, hallazgo: "Alto contenido de proteína y calcio en versiones natural." },
    { id: "alpura-endulzado", marca: "Alpura", nombre: "Natural endulzado deslactosado", nivel: "observado", cumple: true, hallazgo: "Contiene edulcorantes. No recomendable para niñas y niños." },
    { id: "yoplait-cero", marca: "Yoplait", nombre: "Doble Cero", nivel: "observado", cumple: true, hallazgo: "Contiene edulcorantes; no se recomienda para menores." },
    { id: "yoplait-sabor", marca: "Yoplait", nombre: "Yogur sabor natural", nivel: "incumple", cumple: false, hallazgo: "La denominación no existe en la NOM-181." },
    { id: "flor-alfalfa", marca: "Flor de Alfalfa", nombre: "Yogur con fresa", nivel: "incumple", cumple: false, hallazgo: "No alcanza las bacterias lácticas por gramo que exige la norma." },
    { id: "vaca-blanca", marca: "Vaca Blanca", nombre: "Yogur con fresa", nivel: "incumple", cumple: false, hallazgo: "Elaborado con grasa vegetal. No es yogur." }
  ]
};
