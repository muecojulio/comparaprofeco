"use client";

import { useEffect, useState } from "react";
import {
  EVENTO_ANALIZADOS,
  leerAnalizados
} from "../../lib/analizados";

/**
 * Hook de lectura de los analizados guardados.
 * Se sincroniza entre componentes y entre pestañas del navegador.
 */
export function useAnalizados() {
  const [lista, setLista] = useState([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const sync = () => setLista(leerAnalizados());
    sync();
    setListo(true);
    window.addEventListener(EVENTO_ANALIZADOS, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENTO_ANALIZADOS, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { lista, listo };
}

