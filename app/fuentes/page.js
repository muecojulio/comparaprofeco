"use client";

import { useMemo, useRef, useState } from "react";
import { ramos } from "../../lib/data";
import { pdfsFiltrados } from "../../lib/indexes";
import Accordion from "../components/Accordion";
import AsyncButton from "../components/AsyncButton";
import InstalarInvestigaciones from "../components/InstalarInvestigaciones";
import Filters from "../components/Filters";
import OverflowRail from "../components/OverflowRail";

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
      <p className="meta" role="status" aria-live="polite" aria-atomic="true">
        {lista.length} documentos
      </p>
      <OverflowRail
        className="grid card-rail"
        wrapperClassName="overflow-rail--cards"
        role="region"
        ariaLabel="Documentos oficiales de los estudios"
        ariaRoleDescription="lista de documentos desplazable"
        keyboardScroll
      >
        {lista.map((c) => (
          <article className="card card-motion" key={c.id}>
            <div className="emoji" aria-hidden="true">{c.emoji}</div>
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
      </OverflowRail>
      <div className="alert">
        Sitios oficiales: gob.mx/profeco y revistadelconsumidor.profeco.gob.mx.
        También se consulta datos.gob.mx (datos abiertos de Profeco).
      </div>
      <Accordion title="Precios al día (Quién es quién)">
        <InstalarInvestigaciones />
      </Accordion>
      <Accordion title="Datos abiertos (sin key)" initiallyOpen>
        <DatosAbiertos />
      </Accordion>
    </main>
  );
}

function DatosAbiertos() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("idle");
  const inFlight = useRef(false);

  async function load() {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("loading");
    setErr("");

    try {
      const response = await fetch("/api/datos-abiertos?q=profeco&rows=6");
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "No se pudo consultar datos.gob.mx");
      }
      setRows(data.datasets || []);
      setStatus("success");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "No se pudo cargar datos.gob.mx");
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }

  const buttonText = {
    idle: "Consultar datos.gob.mx",
    loading: "Consultando…",
    success: "Consulta completada",
    error: "Reintentar consulta"
  }[status];

  return (
    <div className="open-data-content">
      <AsyncButton estado={status} onClick={load}>
        {buttonText}
      </AsyncButton>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {status === "loading"
          ? "Consultando datos abiertos."
          : status === "success"
            ? `${rows?.length || 0} conjuntos de datos cargados.`
            : ""}
      </p>
      {err && <div className="alert" role="alert">{err}</div>}
      {rows && rows.length === 0 && (
        <p className="meta" role="status">No se encontraron conjuntos de datos.</p>
      )}
      {rows && rows.length > 0 && (
        <OverflowRail
          className="grid card-rail"
          wrapperClassName="overflow-rail--cards"
          role="region"
          ariaLabel="Conjuntos de datos abiertos"
          ariaRoleDescription="lista de conjuntos de datos desplazable"
          keyboardScroll
        >
          {rows.map((dataset) => (
            <article className="card card-motion" key={dataset.name || dataset.title}>
              <h3>{dataset.title}</h3>
              <div className="meta">{dataset.organization}</div>
              {dataset.url && (
                <a className="btn btn-ghost" href={dataset.url} target="_blank" rel="noreferrer">
                  Abrir dataset
                </a>
              )}
            </article>
          ))}
        </OverflowRail>
      )}
    </div>
  );
}
