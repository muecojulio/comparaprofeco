"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { NIVELES, getCategoria, getRamo } from "../../../lib/data";
import SegmentedTabs from "../../components/SegmentedTabs";

function fotoUrl(cat, prod) {
  const prompt = `small product photo of ${prod.marca} ${prod.nombre} ${cat.nombre} Mexico supermarket package, studio light, centered, simple background`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=160&height=160&nologo=true`;
}

function Thumb({ cat, prod }) {
  const [ok, setOk] = useState(true);
  if (!ok) return <div className="thumb-fallback" aria-hidden="true">{cat.emoji}</div>;
  return (
    <img
      className="thumb"
      src={fotoUrl(cat, prod)}
      alt=""
      onError={() => setOk(false)}
    />
  );
}

const evaluationTabs = [
  { value: "todos", label: "Todos", ariaLabel: "Todos los productos" },
  ...Object.entries(NIVELES).map(([value, level]) => ({
    value,
    label: level.short,
    ariaLabel: level.label
  }))
];

const INTERACTIVE_SELECTOR =
  "button, a, input, select, textarea, [role='button'], [role='tab'], [contenteditable='true'], [data-no-swipe], iframe, canvas, [data-map], .map, .leaflet-container, .mapboxgl-map";

function startsOnControl(target) {
  return !(target instanceof Element) || Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function ProductResults({ cat, tab, products }) {
  return (
    <>
      <p className="meta panel-count" aria-live="polite">
        {tab === "todos"
          ? `${products.length} productos · Mejor evaluación, aceptable, con observaciones e incumplimiento.`
          : `${products.length} productos · ${NIVELES[tab].hint}`}
      </p>

      {products.length === 0 && (
        <div className="alert" role="status">
          No hay productos en esta pestaña para este estudio.
        </div>
      )}

      {products.map((product) => (
        <article className="prod" key={product.id}>
          <Thumb cat={cat} prod={product} />
          <div>
            <span className={`badge ${product.nivel}`}>{NIVELES[product.nivel].label}</span>
            {" "}
            <span className={`badge ${product.cumple ? "destacado" : "incumple"}`}>
              {product.cumple ? "Cumple lo revisado" : "No cumple / no es veraz"}
            </span>
            <h3>{product.marca}</h3>
            <div className="meta">{product.nombre}</div>
            <p>{product.hallazgo}</p>
          </div>
        </article>
      ))}
    </>
  );
}

export default function CategoriaPage() {
  const params = useParams();
  const cat = getCategoria(params.id);
  const [tab, setTab] = useState("todos");
  const [panelDirection, setPanelDirection] = useState("forward");
  const [exitingPanel, setExitingPanel] = useState(null);
  const tabGroupId = `evaluation-${useId().replace(/:/g, "")}`;
  const panelId = `${tabGroupId}-panel`;
  const swipeStart = useRef(null);
  const exitTimer = useRef(null);

  const lista = useMemo(() => {
    if (!cat) return [];
    if (tab === "todos") return cat.productos;
    return cat.productos.filter((product) => product.nivel === tab);
  }, [cat, tab]);

  const ramo = cat ? getRamo(cat.ramo) : null;

  useEffect(
    () => () => {
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
    },
    []
  );

  const selectTab = useCallback((nextTab) => {
    const currentIndex = evaluationTabs.findIndex((item) => item.value === tab);
    const nextIndex = evaluationTabs.findIndex((item) => item.value === nextTab);
    if (nextIndex < 0 || nextTab === tab) return;

    const direction = nextIndex >= currentIndex ? "forward" : "backward";
    if (exitTimer.current) window.clearTimeout(exitTimer.current);
    setPanelDirection(direction);
    setExitingPanel({ tab, products: lista, direction });
    setTab(nextTab);

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reducedMotion) {
      setExitingPanel(null);
      exitTimer.current = null;
      return;
    }

    exitTimer.current = window.setTimeout(() => {
      setExitingPanel(null);
      exitTimer.current = null;
    }, 220);
  }, [lista, tab]);

  function handleTouchStart(event) {
    if (event.touches.length !== 1 || startsOnControl(event.target)) {
      swipeStart.current = null;
      return;
    }

    const touch = event.touches[0];
    swipeStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }

  function handleTouchEnd(event) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const distanceX = Math.abs(dx);
    const elapsed = Math.max(1, Date.now() - start.time);
    const isHorizontal = distanceX > Math.abs(dy) * 1.2;
    const hasEnoughTravel = distanceX >= 52 || (distanceX >= 28 && distanceX / elapsed >= 0.55);
    if (!isHorizontal || !hasEnoughTravel) return;

    const currentIndex = evaluationTabs.findIndex((item) => item.value === tab);
    const nextIndex = currentIndex + (dx < 0 ? 1 : -1);
    if (nextIndex >= 0 && nextIndex < evaluationTabs.length) {
      selectTab(evaluationTabs[nextIndex].value);
    }
  }

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
      <a className="meta back-link" href="/">
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

      <SegmentedTabs
        tabs={evaluationTabs}
        value={tab}
        onChange={selectTab}
        idBase={tabGroupId}
        panelId={panelId}
        ariaLabel="Filtrar productos por evaluación"
      />

      <p className="swipe-hint" aria-hidden="true">
        Desliza sobre los resultados para cambiar de filtro
      </p>

      <div className="tab-panels">
        <section
          key={tab}
          className="tab-panel"
          role="tabpanel"
          id={panelId}
          aria-labelledby={`${tabGroupId}-tab-${tab}`}
          tabIndex={0}
          data-direction={panelDirection}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            swipeStart.current = null;
          }}
        >
          <ProductResults cat={cat} tab={tab} products={lista} />
        </section>

        {exitingPanel && (
          <div
            key={`exit-${exitingPanel.tab}`}
            className="tab-panel tab-panel-exit"
            aria-hidden="true"
            inert
            data-direction={exitingPanel.direction}
          >
            <ProductResults
              cat={cat}
              tab={exitingPanel.tab}
              products={exitingPanel.products}
            />
          </div>
        )}
      </div>

      <div className="alert">
        Las fotos son ilustrativas (no son el empaque oficial). La calificación se refiere al
        modelo o presentación del estudio, no a toda la marca para siempre.
      </div>
    </main>
  );
}
