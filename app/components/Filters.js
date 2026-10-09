"use client";

import { useEffect, useRef } from "react";
import { ramos } from "../../lib/data";
import { ANIOS } from "../../lib/indexes";
import OverflowRail from "./OverflowRail";

function scrollSelectedToCenter(rail) {
  if (!rail) return;
  const selected = rail.querySelector('[aria-pressed="true"]');
  if (!selected) return;

  const left = Math.max(
    0,
    selected.offsetLeft - (rail.clientWidth - selected.offsetWidth) / 2
  );
  const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    ? "auto"
    : "smooth";
  rail.scrollTo({ left, behavior });
}

/* ← → mueven el foco entre los chips del filtro y los traen a la vista.
   La selección sigue siendo con Enter/Espacio o con el dedo. */
function moverFoco(evento) {
  if (evento.key !== "ArrowRight" && evento.key !== "ArrowLeft") return;

  const rail = evento.currentTarget;
  const chips = [...rail.querySelectorAll("button")];
  const actual = chips.indexOf(evento.target);
  if (actual < 0 || chips.length < 2) return;

  evento.preventDefault();
  const paso = evento.key === "ArrowRight" ? 1 : -1;
  const siguiente = chips[(actual + paso + chips.length) % chips.length];
  siguiente.focus();
  siguiente.scrollIntoView?.({
    inline: "center",
    block: "nearest",
    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth"
  });
}

function FilterChoice({ selected, onClick, colores, children }) {
  return (
    <button
      type="button"
      className={`tab filter-chip ${colores ? "filter-chip-ramo" : ""}`.trim()}
      style={colores ? { "--ca": colores[0], "--cb": colores[1] } : undefined}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="filter-check" aria-hidden="true">
        {selected ? "✓" : ""}
      </span>
      {children}
    </button>
  );
}

export default function Filters({ ramo, anio, onRamo, onAnio }) {
  const ramoRailRef = useRef(null);
  const yearRailRef = useRef(null);

  useEffect(() => {
    scrollSelectedToCenter(ramoRailRef.current);
    scrollSelectedToCenter(yearRailRef.current);
  }, [ramo, anio]);

  return (
    <div className="filters">
      <OverflowRail
        ref={ramoRailRef}
        className="tabs filter-rail"
        role="group"
        ariaLabel="Filtrar por ramo"
        onKeyDown={moverFoco}
      >
        <FilterChoice selected={ramo === "todos"} onClick={() => onRamo("todos")}>
          Todos los ramos
        </FilterChoice>
        {ramos.map((item) => (
          <FilterChoice
            key={item.id}
            colores={item.colores}
            selected={ramo === item.id}
            onClick={() => onRamo(item.id)}
          >
            <span aria-hidden="true">{item.emoji}</span>
            {item.nombre}
          </FilterChoice>
        ))}
      </OverflowRail>

      <OverflowRail
        ref={yearRailRef}
        className="year-row filter-rail"
        role="group"
        ariaLabel="Filtrar por año del estudio"
        onKeyDown={moverFoco}
      >
        <FilterChoice selected={anio === "todos"} onClick={() => onAnio("todos")}>
          Todo el periodo
        </FilterChoice>
        {ANIOS.map((year) => (
          <FilterChoice
            key={year}
            selected={String(anio) === String(year)}
            onClick={() => onAnio(String(year))}
          >
            {year}
          </FilterChoice>
        ))}
      </OverflowRail>
    </div>
  );
}
