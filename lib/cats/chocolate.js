export const cat_chocolate = {
  id: "chocolate",
  ramo: "alimentos",
  nombre: "Barras de chocolate",
  emoji: "🍫",
  color: "#7c2d12",
  mes: "Marzo",
  anio: 2026,
  analizados: 31,
  pruebas: null,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1064162/RC589_ESTUDIO-CHOCOLATE.pdf",
  fuente: "https://www.elimparcial.com/dinero/2026/07/28/profeco-analiza-31-chocolates-dos-no-demostraron-serlo-y-el-cacao-ayuda-a-detectar-cuales-tienen-menos-azucar/",
  resumen: "Dos productos no demostraron ser chocolate por el tipo de grasa. Siete fallaron en etiquetado.",
  productos: [
    { id: "lindt", marca: "Lindt Excellence", nombre: "Barras con alto cacao (70–90 %)", nivel: "destacado", cumple: true, hallazgo: "Mayor cacao y cumplimiento de información comercial." },
    { id: "bienestar", marca: "Chocolate del Bienestar", nombre: "Barra 70 % cacao", nivel: "destacado", cumple: true, hallazgo: "Marca mexicana citada por pureza de cacao." },
    { id: "carlosv", marca: "Carlos V Nestlé", nombre: "Original con leche", nivel: "aceptable", cumple: true, hallazgo: "Sí es chocolate, con azúcar alta: 57.2 g / 100 g." },
    { id: "vaquita", marca: "Vaquita La Original", nombre: "Con leche", nivel: "observado", cumple: true, hallazgo: "La de más azúcar del comparativo: 59.8 g / 100 g." },
    { id: "golden-hills-choco", marca: "Golden Hills", nombre: "Con leche y amargo", nivel: "observado", cumple: false, hallazgo: "Confundían caducidad con consumo preferente (NOM-051)." },
    { id: "dmeals", marca: "D’Meals", nombre: "Chocolate con leche sin azúcar añadida 100 g", nivel: "incumple", cumple: false, hallazgo: "La grasa no es la del cacao. No demostró ser chocolate." }
  ]
};
