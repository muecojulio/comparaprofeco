"use client";

import { useMemo, useState } from "react";
import { ramos, catsDelRamo, NIVELES, getRamo } from "../../lib/data";
import {
  claveDe,
  fechaTexto,
  guardarAnalizado,
  quitarAnalizado,
  porCategoria
} from "../../lib/analizados";
import { anunciar } from "../../lib/anuncios";
import { useAnalizados } from "../components/useAnalizados";
import Filters from "../components/Filters";
import OverflowRail from "../components/OverflowRail";
import Superficie from "../components/Superficie";

export default function ExplorarPage() {
  const [ramo, setRamo] = useState("todos");
  const [anio, setAnio] = useState("todos");
  const { lista: analizados } = useAnalizados();
  const lista = useMemo(() => catsDelRamo(ramo, anio), [ramo, anio]);

  // Los analizados que el usuario ya abrió viven aquí, en su ramo.
  const guardados = useMemo(
    () => (ramo === "todos" ? analizados : analizados.filter((g) => g.ramo === ramo)),
    [analizados, ramo]
  );
  const guardadosPorCategoria = useMemo(() => porCategoria(analizados), [analizados]);

  /* Quitar avisa qué se quitó y ofrece regresarlo tal cual (sin cambiar la
     fecha en que se abrió). */
  function quitar(g) {
    quitarAnalizado(claveDe(g));
    anunciar({
      texto: `Quité “${g.producto?.marca || ""} · ${g.producto?.nombre || ""}”.`,
      tono: "info",
      etiquetaAccion: "Deshacer",
      onAccion: () => guardarAnalizado(g, { conservar: true })
    });
  }
  const ramoActual = ramos.find((r) => r.id === ramo);

  return (
    <main className="wrap">
      <h1 className="screen-title">Ramos</h1>
      <p className="lead">Elige ramo y año. El catálogo 2024 se conserva completo.</p>

      <section className="guardados-bloque" aria-label="Analizados guardados">
        <div className="guardados-encabezado">
          <h2>
            Tus analizados{ramoActual ? ` en ${ramoActual.nombre}` : ""}
          </h2>
          <span className="meta">
            {guardados.length === 0
              ? "Ninguno todavía"
              : `${guardados.length} guardado${guardados.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {guardados.length === 0 ? (
          <div className="alert">
            Cuando abras el <b>producto analizado de hoy</b> desde Inicio, se queda guardado
            aquí, en su ramo y su categoría, aunque cambie el día.
          </div>
        ) : (
          <>
            <p className="meta">
              Se quedan en el dispositivo aunque cambie el producto del día. Toca uno para ver la
              ficha completa del estudio.
            </p>
            <ul className="guardados-lista">
              {guardados.map((g) => {
                const clave = claveDe(g);
                const nivel = NIVELES[g.producto?.nivel];
                return (
                  <li className="guardado" key={clave}>
                    <Superficie className="guardado-link" href={`/categoria/${g.categoriaId}`}>
                      <span className={`badge ${g.producto?.nivel || ""}`}>
                        {nivel ? nivel.short : "Analizado"}
                      </span>{" "}
                      <h3>
                        {g.producto?.marca} · {g.producto?.nombre}
                      </h3>
                      <span className="meta">
                        {getRamo(g.ramo)?.nombre || "Ramo"} · {g.categoria} · abierto el{" "}
                        {fechaTexto(g.abierto)}
                      </span>
                    </Superficie>
                    <button
                      type="button"
                      className="btn btn-ghost guardado-quitar"
                      onClick={() => quitar(g)}
                      aria-label={`Quitar ${g.producto?.nombre} de tus analizados`}
                    >
                      Quitar
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <h2 style={{ marginTop: 28, marginBottom: 8 }}>Catálogo</h2>
      <Filters ramo={ramo} anio={anio} onRamo={setRamo} onAnio={setAnio} />
      {ramoActual && (
        <p className="lead" style={{ marginTop: 12, fontSize: 16 }}>
          {ramoActual.detalle}
        </p>
      )}
      <p className="meta" role="status" aria-live="polite" aria-atomic="true">
        {lista.length} categorías
      </p>
      <OverflowRail
        className="grid card-rail"
        wrapperClassName="overflow-rail--cards"
        role="region"
        ariaLabel="Categorías de los ramos"
        ariaRoleDescription="lista de categorías desplazable"
        keyboardScroll
      >
        {lista.map((c) => (
          <Superficie className="card card-motion" key={c.id} href={`/categoria/${c.id}`}>
            <div className="emoji" aria-hidden="true">{c.emoji}</div>
            <h3>{c.nombre}</h3>
            <div className="meta">
              {c.mes} {c.anio}
            </div>
            {guardadosPorCategoria.has(c.id) && (
              <div className="meta">
                <span className="badge destacado">★ Tienes analizados</span>
              </div>
            )}
          </Superficie>
        ))}
      </OverflowRail>
    </main>
  );
}
