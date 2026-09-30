export const cat_jamon = {
  id: "jamon", ramo: "alimentos", nombre: "Jamón y embutidos", emoji: "🥓", color: "#9f1239", mes: "Julio", anio: 2025, analizados: 40, pruebas: null,
  pdf: "https://www.gob.mx/cms/uploads/attachment/file/1010223/RC581_023-038-Estudio-Jamon-02.pdf",
  fuente: "https://www.gob.mx/profeco/documentos/estudios-de-calidad-2025?state=published",
  resumen: "Algunos exceden nitritos o no son jamón: son embutidos con soya o fécula.",
  productos: [
    { id: "jamon-ok", marca: "Varias marcas que sí son jamón", nombre: "Presentaciones que cumplieron", nivel: "aceptable", cumple: true, hallazgo: "Abre el PDF para tu marca exacta." },
    { id: "el-mexicano", marca: "El Mexicano", nombre: "Jamón campirano de pavo", nivel: "incumple", cumple: false, hallazgo: "Nitritos 191 mg/kg; máximo 156 mg/kg." },
    { id: "bafar-virginia", marca: "Bafar", nombre: "Jamón de pavo Virginia", nivel: "incumple", cumple: false, hallazgo: "Declara 12 % de proteína; laboratorio 11.2 %." },
    { id: "fud-horneado", marca: "Fud", nombre: "Jamón de pierna horneado", nivel: "incumple", cumple: false, hallazgo: "Declara más proteína de la que contiene." },
    { id: "aurrera-embutido", marca: "Aurrera", nombre: "Embutido cocido de cerdo y pavo", nivel: "incumple", cumple: false, hallazgo: "No es jamón. Declara 500 g y contenía 483.1 g." }
  ]
};
