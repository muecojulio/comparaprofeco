"use client";

import { ramos } from "../../lib/data";
import { ANIOS } from "../../lib/indexes";

export default function Filters({ ramo, anio, onRamo, onAnio }) {
  return (
    <div className="filters">
      <div className="tabs" role="tablist" aria-label="Ramo">
        <button
          type="button"
          className={`tab ${ramo === "todos" ? "on" : ""}`}
          aria-pressed={ramo === "todos"}
          onClick={() => onRamo("todos")}
        >
          Todos
        </button>
        {ramos.map((r) => (
          <button
            type="button"
            key={r.id}
            className={`tab ${ramo === r.id ? "on" : ""}`}
            aria-pressed={ramo === r.id}
            onClick={() => onRamo(r.id)}
          >
            {r.emoji} {r.nombre}
          </button>
        ))}
      </div>
      <div className="year-row" role="group" aria-label="Año del estudio">
        <button
          type="button"
          className={`tab ${anio === "todos" ? "on" : ""}`}
          aria-pressed={anio === "todos"}
          onClick={() => onAnio("todos")}
        >
          Todo el periodo
        </button>
        {ANIOS.map((y) => (
          <button
            type="button"
            key={y}
            className={`tab ${String(anio) === String(y) ? "on" : ""}`}
            aria-pressed={String(anio) === String(y)}
            onClick={() => onAnio(String(y))}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
