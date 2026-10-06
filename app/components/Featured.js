"use client";

import { useEffect, useState } from "react";
import { getRamo } from "../../lib/data";
import { claveDe, guardarAnalizado } from "../../lib/analizados";
import { anunciar } from "../../lib/anuncios";
import { useAnalizados } from "./useAnalizados";
import Superficie from "./Superficie";

export default function Featured() {
  const [item, setItem] = useState(null);
  const { lista } = useAnalizados();

  useEffect(() => {
    let alive = true;
    const cached = sessionStorage.getItem("cp-featured");
    if (cached) {
      try {
        setItem(JSON.parse(cached));
      } catch {}
    }
    fetch("/api/featured")
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !data?.item) return;
        sessionStorage.setItem("cp-featured", JSON.stringify(data.item));
        setItem(data.item);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!item) return null;

  const ramo = getRamo(item.ramo);
  const guardado = lista.some((g) => claveDe(g) === claveDe(item));

  // Al abrirlo queda guardado en su ramo y en su categoría (lib/analizados.js).
  function guardarAlAbrir() {
    guardarAnalizado(item);
    anunciar({
      texto: `Guardado en tus analizados${ramo ? ` · ${ramo.nombre}` : ""}.`,
      tono: "exito",
      duracion: 4000
    });
  }

  return (
    <Superficie
      className="featured card-motion"
      href={`/categoria/${item.categoriaId}`}
      onClick={guardarAlAbrir}
      data-guardado={guardado ? "si" : "no"}
    >
      <div className="kicker">Producto analizado hoy</div>
      <h2>
        {item.producto.marca} · {item.producto.nombre}
      </h2>
      <p className="meta">
        {ramo ? `${ramo.nombre} · ` : ""}
        {item.categoria} · {item.mes} {item.anio}
      </p>
      <p>{item.producto.hallazgo}</p>
      <p className="featured-guardado">
        {guardado ? (
          <>
            <span className="badge destacado">✓ Guardado en tus ramos</span>{" "}
            <span className="meta">
              Está en {ramo ? ramo.nombre : "su ramo"} › {item.categoria}
            </span>
          </>
        ) : (
          <span className="badge">Al abrirlo se queda en tus ramos</span>
        )}
      </p>
    </Superficie>
  );
}
