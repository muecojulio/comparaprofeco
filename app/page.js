"use client";

import { useMemo, useState } from "react";
import { APP, ramos, categorias, buscar, catsDelRamo } from "../lib/data";
import Filters from "./components/Filters";
import Featured from "./components/Featured";
import Switch from "./components/Switch";

export default function HomePage() {
  const [q, setQ] = useState("");
  const [ramo, setRamo] = useState("todos");
  const [anio, setAnio] = useState("todos");
  const [soloDestacados, setSoloDestacados] = useState(false);
  const results = useMemo(() => (q.trim().length > 1 ? buscar(q) : []), [q]);
  const lista = useMemo(() => {
    let items = catsDelRamo(ramo, anio);
    if (soloDestacados) {
      items = items.filter((c) => c.productos?.some((p) => p.nivel === "destacado"));
    }
    return items;
  }, [ramo, anio, soloDestacados]);

  return (
    <main className="wrap">
      <section className="hero">
        <div className="kicker">App familiar</div>
        <h1 className="screen-title">Compara antes de comprar</h1>
        <p className="lead">
          Los mismos ramos que cubre Profeco. Filtro por ramo y por año (2024, 2025, 2026 o todo el periodo).
        </p>
        <form className="search" onSubmit={(e) => e.preventDefault()}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca: champú, jamón, sartén, Colgate…"
            aria-label="Buscar"
          />
          <button className="btn btn-primary" type="button">
            Buscar
          </button>
        </form>
        {results.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {results.slice(0, 8).map((hit, i) =>
              hit.tipo === "categoria" ? (
                <a className="hit" key={`c-${i}`} href={`/categoria/${hit.cat.id}`}>
                  <strong>{hit.cat.emoji} {hit.cat.nombre}</strong>
                  <div className="meta">Ver comparativo</div>
                </a>
              ) : (
                <a className="hit" key={`p-${i}`} href={`/categoria/${hit.cat.id}`}>
                  <strong>{hit.p.marca}</strong> · {hit.p.nombre}
                  <div className="meta">{hit.cat.nombre}</div>
                </a>
              )
            )}
          </div>
        )}
        <div className="pills" style={{ marginTop: 16 }}>
          <a className="btn btn-gold" href="/instalar">Instalar en el celular</a>
          <a className="btn btn-ghost" href="/fuentes">Fuentes Profeco</a>
          <a className="btn btn-ghost" href="/privacidad">Privacidad</a>
        </div>
      </section>

      <Featured />

      <h2 style={{ marginTop: 28, marginBottom: 8 }}>Catálogo</h2>
      <Filters ramo={ramo} anio={anio} onRamo={setRamo} onAnio={setAnio} />
      <Switch
        name="destacados"
        checked={soloDestacados}
        onChange={setSoloDestacados}
        label="Solo estudios con producto destacado"
      />

      {ramo !== "todos" && (
        <p className="lead" style={{ marginTop: 12, fontSize: 16 }}>
          {ramos.find((r) => r.id === ramo)?.detalle}
        </p>
      )}

      <p className="meta">
        {lista.length} categorías visibles · {categorias.length} en el catálogo completo
      </p>

      <div className="grid">
        {lista.map((c) => (
          <a className="card card-motion" key={c.id} href={`/categoria/${c.id}`}>
            <div className="emoji">{c.emoji}</div>
            <h3>{c.nombre}</h3>
            <div className="meta">
              {c.mes} {c.anio}
              {c.analizados ? ` · ${c.analizados} analizados` : ""}
            </div>
            <div className="meta">{c.productos.length} fichas</div>
          </a>
        ))}
      </div>

      <div className="alert">{APP.disclaimer}</div>
    </main>
  );
}
