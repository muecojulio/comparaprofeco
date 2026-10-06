"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { NIVELES, getCategoria, getRamo } from "../../../lib/data";
import { productoDelDia } from "../../../lib/featured";
import { claveDe, fechaTexto, guardarAnalizado, quitarAnalizado } from "../../../lib/analizados";
import { anunciar } from "../../../lib/anuncios";
import { useAnalizados } from "../../components/useAnalizados";
import SegmentedTabs from "../../components/SegmentedTabs";
import Superficie from "../../components/Superficie";
import TabSwipePanel from "../../components/TabSwipePanel";

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
        <Superficie as="article" className="prod" key={product.id}>
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
        </Superficie>
      ))}
    </>
  );
}

export default function CategoriaPage() {
  const params = useParams();
  const cat = getCategoria(params.id);
  const [tab, setTab] = useState("todos");
  const tabGroupId = `evaluation-${useId().replace(/:/g, "")}`;
  const panelId = `${tabGroupId}-panel`;

  // Productos de una pestaña concreta: lo usa el panel activo y también el que
  // se está yendo (por eso es una función y no un valor único).
  const productosDe = useCallback(
    (cual) => {
      if (!cat) return [];
      if (cual === "todos") return cat.productos;
      return cat.productos.filter((product) => product.nivel === cual);
    },
    [cat]
  );

  const ramo = cat ? getRamo(cat.ramo) : null;

  // Analizados que el usuario ya abrió y que pertenecen a este estudio.
  const { lista: analizados } = useAnalizados();
  const guardadosAqui = useMemo(
    () => analizados.filter((g) => g.categoriaId === cat?.id),
    [analizados, cat?.id]
  );

  // ¿Este estudio es el del "producto analizado de hoy"? (se calcula en el cliente
  // para no desajustar la hidratación: el resultado depende de la fecha).
  const [destacadoHoy, setDestacadoHoy] = useState(null);
  useEffect(() => {
    if (!cat) return;
    const hoy = productoDelDia();
    setDestacadoHoy(hoy?.categoriaId === cat.id ? hoy : null);
  }, [cat]);

  const guardadoHoy = Boolean(
    destacadoHoy && guardadosAqui.some((g) => claveDe(g) === claveDe(destacadoHoy))
  );


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

      {guardadosAqui.length > 0 && (
        <section className="guardados-bloque" aria-label="Analizados guardados de este estudio">
          <div className="guardados-encabezado">
            <h2>Tus analizados de este estudio</h2>
            <span className="meta">
              {ramo ? ramo.nombre : "Ramo"} › {cat.nombre}
            </span>
          </div>
          <ul className="guardados-lista">
            {guardadosAqui.map((g) => {
              const clave = claveDe(g);
              const nivel = NIVELES[g.producto?.nivel];
              return (
                <li className="guardado" key={clave}>
                  <div className="guardado-link" data-no-swipe>
                    <span className={`badge ${g.producto?.nivel || ""}`}>
                      {nivel ? nivel.label : "Analizado"}
                    </span>{" "}
                    <h3>
                      {g.producto?.marca} · {g.producto?.nombre}
                    </h3>
                    <span className="meta">
                      Abierto el {fechaTexto(g.abierto)}
                      {g.analizado ? ` · analizado el ${fechaTexto(g.analizado)}` : ""}
                    </span>
                    {g.producto?.hallazgo ? <p>{g.producto.hallazgo}</p> : null}
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost guardado-quitar"
                    onClick={() => {
                      quitarAnalizado(clave);
                      anunciar({
                        texto: `Quité “${g.producto?.marca || ""} · ${g.producto?.nombre || ""}”.`,
                        tono: "info",
                        etiquetaAccion: "Deshacer",
                        onAccion: () => guardarAnalizado(g, { conservar: true })
                      });
                    }}
                    aria-label={`Quitar ${g.producto?.nombre} de tus analizados`}
                  >
                    Quitar
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {destacadoHoy && !guardadoHoy && (
        <div className="alert guardado-sugerencia">
          Este estudio tiene el <b>producto analizado de hoy</b>: {destacadoHoy.producto.marca} ·{" "}
          {destacadoHoy.producto.nombre}.{" "}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              guardarAnalizado(destacadoHoy);
              anunciar({ texto: "Guardado en tus analizados.", tono: "exito", duracion: 4000 });
            }}
            data-no-swipe
          >
            Guardarlo en mis analizados
          </button>
        </div>
      )}

      <SegmentedTabs
        tabs={evaluationTabs}
        value={tab}
        onChange={setTab}
        idBase={tabGroupId}
        panelId={panelId}
        ariaLabel="Filtrar productos por evaluación"
      />

      <TabSwipePanel
        tabs={evaluationTabs}
        value={tab}
        onChange={setTab}
        idBase={tabGroupId}
        panelId={panelId}
        pista="Desliza sobre los resultados para cambiar de filtro"
        renderPanel={(cual) => (
          <ProductResults cat={cat} tab={cual} products={productosDe(cual)} />
        )}
      />

      <div className="alert">
        Las fotos son ilustrativas (no son el empaque oficial). La calificación se refiere al
        modelo o presentación del estudio, no a toda la marca para siempre.
      </div>
    </main>
  );
}
