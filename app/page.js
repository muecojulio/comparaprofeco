"use client";

import { useMemo, useState } from "react";
import { APP, ramos, categorias, catsDelRamo } from "../lib/data";
import Filters from "./components/Filters";
import Featured from "./components/Featured";
import OverflowRail from "./components/OverflowRail";
import SearchCombobox from "./components/SearchCombobox";
import Switch from "./components/Switch";

export default function HomePage() {
  const [ramo, setRamo] = useState("todos");
  const [anio, setAnio] = useState("todos");
  const [soloDestacados, setSoloDestacados] = useState(false);
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
        <SearchCombobox />
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

      <p className="meta" role="status" aria-live="polite" aria-atomic="true">
        {lista.length} categorías visibles · {categorias.length} en el catálogo completo
      </p>

      <OverflowRail
        className="grid card-rail"
        wrapperClassName="overflow-rail--cards"
        role="region"
        ariaLabel="Categorías del catálogo"
        ariaRoleDescription="lista de categorías desplazable"
        keyboardScroll
      >
        {lista.map((c) => (
          <a className="card card-motion" key={c.id} href={`/categoria/${c.id}`}>
            <div className="emoji" aria-hidden="true">{c.emoji}</div>
            <h3>{c.nombre}</h3>
            <div className="meta">
              {c.mes} {c.anio}
              {c.analizados ? ` · ${c.analizados} analizados` : ""}
            </div>
            <div className="meta">{c.productos.length} fichas</div>
          </a>
        ))}
      </OverflowRail>

      <div className="alert">{APP.disclaimer}</div>
    </main>
  );
}
