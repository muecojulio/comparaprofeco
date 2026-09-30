"use client";

import { useMemo, useState } from "react";
import { ramos } from "../../lib/data";
import { pdfsFiltrados } from "../../lib/indexes";
import Filters from "../components/Filters";

export default function FuentesPage() {
  const [ramo, setRamo] = useState("todos");
  const [anio, setAnio] = useState("todos");
  const lista = useMemo(() => pdfsFiltrados(ramo, anio), [ramo, anio]);

  return (
    <main className="wrap">
      <section className="hero">
        <div className="kicker">Transparencia</div>
        <h1>PDFs 2024 · 2025 · 2026</h1>
        <p className="lead">
          Fuentes lista los PDFs de los tres años. Cada ficha apunta al documento o a la página oficial.
        </p>
        <p className="meta">{ramos.map((r) => r.nombre).join(" · ")}</p>
      </section>
      <Filters ramo={ramo} anio={anio} onRamo={setRamo} onAnio={setAnio} />
      <p className="meta">{lista.length} documentos</p>
      <div className="grid" style={{ marginTop: 18 }}>
        {lista.map((c) => (
          <article className="card card-motion" key={c.id}>
            <div className="emoji">{c.emoji}</div>
            <h3>{c.nombre}</h3>
            <div className="meta">
              {c.mes} {c.anio} · {c.ramoNombre}
            </div>
            <div className="pills">
              <a className="btn btn-ghost" href={c.pdf} target="_blank" rel="noreferrer">
                PDF
              </a>
              <a className="btn btn-primary" href={c.fuente} target="_blank" rel="noreferrer">
                Fuente
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="alert">
        Sitios oficiales: gob.mx/profeco y revistadelconsumidor.profeco.gob.mx.
        También se consulta datos.gob.mx y Open Food Facts, sin quitar las ligas que ya tenía la app.
      </div>
      <DatosAbiertos />
    </main>
  );
}

function DatosAbiertos() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  function load() {
    setErr("");
    fetch("/api/datos-abiertos?q=profeco&rows=6")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setErr(d.error);
        else setRows(d.datasets || []);
      })
      .catch(() => setErr("No se pudo cargar datos.gob.mx"));
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Datos abiertos (sin key)</h2>
      <button className="btn btn-primary" type="button" onClick={load}>
        Consultar datos.gob.mx
      </button>
      {err && <div className="alert">{err}</div>}
      {rows && (
        <div className="grid">
          {rows.map((d) => (
            <article className="card" key={d.name || d.title}>
              <h3>{d.title}</h3>
              <div className="meta">{d.organization}</div>
              {d.url && (
                <a className="btn btn-ghost" href={d.url} target="_blank" rel="noreferrer">
                  Abrir dataset
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
