"use client";

import { useMemo, useState } from "react";
import { ramos, catsDelRamo } from "../../lib/data";
import Filters from "../components/Filters";

export default function ExplorarPage() {
  const [ramo, setRamo] = useState("todos");
  const [anio, setAnio] = useState("todos");
  const lista = useMemo(() => catsDelRamo(ramo, anio), [ramo, anio]);

  return (
    <main className="wrap">
      <h1 className="screen-title">Ramos</h1>
      <p className="lead">Elige ramo y año. El catálogo 2024 se conserva completo.</p>
      <Filters ramo={ramo} anio={anio} onRamo={setRamo} onAnio={setAnio} />
      {ramo !== "todos" && (
        <p className="lead" style={{ marginTop: 12, fontSize: 16 }}>
          {ramos.find((r) => r.id === ramo)?.detalle}
        </p>
      )}
      <p className="meta">{lista.length} categorías</p>
      <div className="grid">
        {lista.map((c) => (
          <a className="card card-motion" key={c.id} href={`/categoria/${c.id}`}>
            <div className="emoji">{c.emoji}</div>
            <h3>{c.nombre}</h3>
            <div className="meta">
              {c.mes} {c.anio}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
