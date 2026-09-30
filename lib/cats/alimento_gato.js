export const cat_alimento_gato = {
  id: "alimento-gato", ramo: "alimentos", nombre: "Alimento húmedo para gato", emoji: "🐱", color: "#6d28d9", mes: "Agosto", anio: 2026, analizados: 54, pruebas: null,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1094862/RC594_021-040-ESTUDIO-CALIDAD-ALIMENTO-GATO.pdf",
  fuente: "https://www.gob.mx/profeco/prensa/revista-del-consumidor-detecta-incumplimientos-en-alimento-humedo-para-gato",
  resumen: "Todos cumplieron contenido neto. Hubo leyendas no comprobables e imagen de salmón sin salmón.",
  productos: [
    { id: "gato-ok", marca: "Varias marcas", nombre: "Alimentos que coincidieron", nivel: "aceptable", cumple: true, hallazgo: "Revisa el PDF para tu marca exacta." },
    { id: "purina-one", marca: "Purina One", nombre: "Visible Nutrition con carne", nivel: "incumple", cumple: false, hallazgo: "Leyenda SUPER NUTRIENTES no comprobable." },
    { id: "grandpet-carne", marca: "Grand Pet", nombre: "Carne Fresca", nivel: "incumple", cumple: false, hallazgo: "Imagen de salmón que no va en ingredientes. Proteína menor a la declarada." },
    { id: "grandpet-pavo", marca: "Grand Pet", nombre: "Kisha Pavo", nivel: "incumple", cumple: false, hallazgo: "Proteína 7.8 % contra 9 % declarado." },
    { id: "grandpet-gourmet", marca: "Grand Pet", nombre: "Natural Gourmet pescado", nivel: "incumple", cumple: false, hallazgo: "Proteína 7.9 % vs 11 % declarado." },
    { id: "gosbi", marca: "Gosbi", nombre: "Fresko Adult Tuna with Salmon", nivel: "incumple", cumple: false, hallazgo: "Humedad 83.9 % contra máximo 82 %." }
  ]
};
