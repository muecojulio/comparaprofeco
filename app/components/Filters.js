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

function FilterChoice({ selected, onClick, children }) {
  return (
    <button
      type="button"
      className="tab filter-chip"
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
      >
        <FilterChoice selected={ramo === "todos"} onClick={() => onRamo("todos")}>
          Todos los ramos
        </FilterChoice>
        {ramos.map((item) => (
          <FilterChoice
            key={item.id}
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
