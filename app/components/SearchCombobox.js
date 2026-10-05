"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buscar } from "../../lib/data";

function cleanId(value) {
  return value.replace(/:/g, "");
}

function optionLabel(hit) {
  return hit.tipo === "categoria"
    ? `${hit.cat.nombre} · Ver comparativo`
    : `${hit.p.marca} · ${hit.p.nombre} · ${hit.cat.nombre}`;
}

export default function SearchCombobox() {
  const router = useRouter();
  const baseId = cleanId(useId());
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const optionRefs = useRef({});
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(
    () => (query.trim().length > 1 ? buscar(query).slice(0, 8) : []),
    [query]
  );
  const hasQuery = query.trim().length > 1;
  const showOptions = isOpen && hasQuery && results.length > 0;
  const showEmpty = isOpen && hasQuery && results.length === 0;

  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(results.length ? 0 : -1);
  }, [activeIndex, results.length]);

  useEffect(() => {
    if (!showOptions || activeIndex < 0) return;
    const listbox = document.getElementById(listboxId);
    const option = optionRefs.current[activeIndex];
    if (!listbox || !option) return;

    const optionTop = option.offsetTop;
    const optionBottom = optionTop + option.offsetHeight;
    if (optionTop < listbox.scrollTop) {
      listbox.scrollTo({ top: optionTop, behavior: "auto" });
    } else if (optionBottom > listbox.scrollTop + listbox.clientHeight) {
      listbox.scrollTo({
        top: optionBottom - listbox.clientHeight,
        behavior: "auto"
      });
    }
  }, [activeIndex, listboxId, showOptions]);

  useEffect(() => {
    function closeOnOutsidePointer(event) {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function chooseResult(hit) {
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/categoria/${hit.cat.id}`);
  }

  function chooseActiveResult() {
    if (!results.length) {
      setIsOpen(true);
      return;
    }
    chooseResult(results[activeIndex >= 0 ? activeIndex : 0]);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!results.length) {
        setIsOpen(true);
        return;
      }
      setIsOpen(true);
      setActiveIndex((index) =>
        !isOpen || index < 0 ? 0 : Math.min(index + 1, results.length - 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) {
        setIsOpen(true);
        return;
      }
      setIsOpen(true);
      setActiveIndex((index) =>
        !isOpen || index < 0 ? results.length - 1 : Math.max(index - 1, 0)
      );
      return;
    }

    if (event.key === "Home" && showOptions) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End" && showOptions) {
      event.preventDefault();
      setActiveIndex(results.length - 1);
      return;
    }

    if (event.key === "Enter" && hasQuery) {
      event.preventDefault();
      chooseActiveResult();
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsOpen(true);
    setActiveIndex((index) => (index >= 0 ? index : 0));
    inputRef.current?.focus();
  }

  return (
    <div className="search-combobox" ref={rootRef}>
      <form
        className="search"
        role="search"
        aria-label="Buscar estudios y productos"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor={inputId}>
          Buscar productos y categorías
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (hasQuery) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Busca: champú, jamón, sartén, Colgate…"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={showOptions}
          aria-controls={listboxId}
          aria-activedescendant={
            showOptions && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          autoComplete="off"
        />
        <button className="btn btn-primary" type="submit">
          Buscar
        </button>
      </form>

      <div
        className="search-results"
        id={listboxId}
        role="listbox"
        aria-label="Coincidencias de búsqueda"
        hidden={!showOptions}
      >
        {results.map((hit, index) => {
          const selected = index === activeIndex;
          return (
            <div
              ref={(node) => {
                if (node) optionRefs.current[index] = node;
                else delete optionRefs.current[index];
              }}
              className="search-option"
              id={`${listboxId}-option-${index}`}
              key={`${hit.tipo}-${hit.cat.id}-${hit.p?.id || ""}`}
              role="option"
              aria-label={optionLabel(hit)}
              aria-selected={selected}
              onPointerMove={(event) => {
                if (event.pointerType === "mouse") setActiveIndex(index);
              }}
              onClick={() => chooseResult(hit)}
            >
              {hit.tipo === "categoria" ? (
                <>
                  <strong>{hit.cat.emoji} {hit.cat.nombre}</strong>
                  <span className="meta">Ver comparativo</span>
                </>
              ) : (
                <>
                  <strong>{hit.p.marca} · {hit.p.nombre}</strong>
                  <span className="meta">{hit.cat.nombre}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {showEmpty && (
        <p className="search-empty" role="status">
          No hay coincidencias para “{query.trim()}”. Prueba con otra palabra.
        </p>
      )}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {showOptions
          ? `${results.length} sugerencias disponibles. Usa las flechas para recorrerlas.`
          : ""}
      </p>
    </div>
  );
}
