"use client";

import { useEffect, useState } from "react";

export default function Featured() {
  const [item, setItem] = useState(null);

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

  return (
    <a className="featured card-motion" href={`/categoria/${item.categoriaId}`}>
      <div className="kicker">Producto analizado hoy</div>
      <h2>
        {item.producto.marca} · {item.producto.nombre}
      </h2>
      <p className="meta">
        {item.categoria} · {item.mes} {item.anio}
      </p>
      <p>{item.producto.hallazgo}</p>
    </a>
  );
}
