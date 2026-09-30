"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { NIVELES, getCategoria, getRamo } from "../../../lib/data";

function fotoUrl(cat, prod) {
  const prompt = `small product photo of ${prod.marca} ${prod.nombre} ${cat.nombre} Mexico supermarket package, studio light, centered, simple background`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=160&height=160&nologo=true`;
}

function Thumb({ cat, prod }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <div className="thumb-fallback">{cat.emoji}</div>;
  return (
    <img
      className="thumb"
      src={fotoUrl(cat, prod)}
      alt=""
      onError={() => setOk(false)}
    />
  );
}

export default function CategoriaPage() {
  const params = useParams();
  const cat = getCategoria(params.id);
  const [tab, setTab] = useState("todos");

  const lista = useMemo(() => {
    if (!cat) return [];
    if (tab === "todos") return cat.productos;
    return cat.productos.filter((p) => p.nivel === tab);
  }, [cat, tab]);

  const ramo = cat ? getRamo(cat.ramo) : null;

  if (!cat) {
    return (
      <main className="wrap">
        <h1>No encontré esa categoría</h1>
        <a className="btn btn-primary" href="/">Volver al inicio</a>
      </main>
    );
  }

  return (
    <main className="wrap">
      <a className="meta" href="/" style={{ textDecoration: "none" }}>
        ← {ramo ? ramo.nombre : "Todos los ramos"}
      </a>
      <section className="hero" style={{ marginTop: 10 }}>
        <div className="kicker">
          {cat.emoji} Estudio · {cat.mes} {cat.anio}
        </div>
        <h1>{cat.nombre}</h1>
        <p className="lead">{cat.resumen}</p>
        <div className="meta">
          {cat.analizados ? `${cat.analizados} analizados` : "Muestra publicada"}
          {cat.pruebas ? ` · ${cat.pruebas.toLocaleString("es-MX")} pruebas` : ""}
        </div>
        <div className="pills">
          <a className="btn btn-primary" href={cat.pdf} target="_blank" rel="noreferrer">
            Abrir PDF oficial
          </a>
          <a className="btn btn-ghost" href={cat.fuente} target="_blank" rel="noreferrer">
            Fuente
          </a>
        </div>
      </section>

      <div className="tabs" style={{ marginTop: 18 }}>
        <button className={`tab ${tab === "todos" ? "on" : ""}`} onClick={() => setTab("todos")}>
          Todos
        </button>
        {Object.entries(NIVELES).map(([key, val]) => (
          <button
            key={key}
            className={`tab ${tab === key ? "on" : ""}`}
            onClick={() => setTab(key)}
          >
            {val.short}
          </button>
        ))}
      </div>

      <p className="meta" style={{ marginTop: 10 }}>
        {tab === "todos"
          ? "Mejor evaluación, aceptable, con observaciones e incumplimiento."
          : NIVELES[tab].hint}
      </p>

      {lista.length === 0 && (
        <div className="alert">No hay productos en esta pestaña para este estudio.</div>
      )}

      {lista.map((p) => (
        <article className="prod" key={p.id}>
          <Thumb cat={cat} prod={p} />
          <div>
            <span className={`badge ${p.nivel}`}>{NIVELES[p.nivel].label}</span>
            {" "}
            <span className={`badge ${p.cumple ? "destacado" : "incumple"}`}>
              {p.cumple ? "Cumple lo revisado" : "No cumple / no es veraz"}
            </span>
            <h3>
              {p.marca}
            </h3>
            <div className="meta">{p.nombre}</div>
            <p>{p.hallazgo}</p>
          </div>
        </article>
      ))}

      <div className="alert">
        Las fotos son ilustrativas (no son el empaque oficial). La calificación se refiere al
        modelo o presentación del estudio, no a toda la marca para siempre.
      </div>
    </main>
  );
}
