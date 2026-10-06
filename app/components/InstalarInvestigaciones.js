"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  borrarInvestigaciones,
  fechaBonita,
  guardarInvestigaciones,
  guardarMeta,
  leerInvestigaciones,
  leerMeta,
  miles,
  tocaRevisar
} from "../../lib/investigaciones-store";

/**
 * Botón que baja e instala las investigaciones de precios más recientes de
 * PROFECO (datos.gob.mx) y las deja guardadas en el dispositivo:
 *
 *  · al abrir la app usa lo que ya estaba guardado (funciona sin internet);
 *  · si no hay nada guardado, instala el archivo que trae el deploy;
 *  · revisa el portal una vez al día (una sola petición, barata);
 *  · si publicaron algo nuevo, el botón se enciende: "Instalar <periodo>".
 */

const ARCHIVO_DEL_DEPLOY = "/data/profeco-latest.json";
const URL_API = "/api/actualizar";
const UN_DIA = 24 * 60 * 60 * 1000;

export default function InstalarInvestigaciones() {
  const [snapshot, setSnapshot] = useState(null);
  const [fase, setFase] = useState("iniciando"); // iniciando | listo | revisando | bajando | instalando | error
  const [mensaje, setMensaje] = useState("Cargando investigaciones guardadas…");
  const [progreso, setProgreso] = useState(0);
  const [novedad, setNovedad] = useState(null);
  const [error, setError] = useState("");
  const [cargado, setCargado] = useState(false);
  const ocupado = fase === "revisando" || fase === "bajando" || fase === "instalando";
  const enCurso = useRef(false);

  /* 1 · al abrir: lo guardado primero, luego lo que trae el deploy */
  useEffect(() => {
    let vivo = true;
    (async () => {
      const local = await leerInvestigaciones();
      if (!vivo) return;
      if (local) {
        setSnapshot(local);
        setFase("listo");
        setMensaje(`Investigaciones guardadas: ${local.fuente?.periodo} (datos al ${fechaBonita(local.actualizado)}).`);
      }

      try {
        const r = await fetch(ARCHIVO_DEL_DEPLOY, { cache: "force-cache" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const delDeploy = await r.json();
        if (!vivo) return;
        const masNuevo = !local || String(delDeploy?.fuente?.publicadoEn || "") > String(local?.fuente?.publicadoEn || "");
        if (masNuevo) {
          await guardarInvestigaciones(delDeploy);
          setSnapshot(delDeploy);
          setFase("listo");
          setMensaje(
            local
              ? `Actualizadas con las del último despliegue: ${delDeploy.fuente?.periodo}.`
              : `Investigaciones instaladas: ${delDeploy.fuente?.periodo} (datos al ${fechaBonita(delDeploy.actualizado)}).`
          );
        }
      } catch {
        if (!vivo) return;
        if (!local) {
          setFase("listo");
          setMensaje("Aún no hay investigaciones instaladas. Toca el botón para bajarlas.");
        }
      } finally {
        if (vivo) setCargado(true);
      }
    })();
    return () => { vivo = false; };
  }, []);

  /* 2 · revisión barata (una vez al día) para saber si publicaron algo nuevo */
  const revisar = useCallback(async ({ forzar = false } = {}) => {
    const guardado = await leerInvestigaciones();
    if (!forzar && !tocaRevisar(UN_DIA)) {
      const meta = leerMeta();
      if (meta?.novedad) setNovedad(meta.novedad);
      return;
    }
    setFase("revisando");
    setMensaje("Revisando si PROFECO publicó investigaciones nuevas…");
    try {
      const r = await fetch(`${URL_API}?solo=verificar&version=${encodeURIComponent(guardado?.version || "")}`, { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "respuesta inválida");
      guardarMeta({ ultimaRevision: Date.now(), novedad: d.novedad ? { periodo: d.periodo, publicadoEn: d.publicadoEn, version: d.version } : null });
      setNovedad(d.novedad ? { periodo: d.periodo, publicadoEn: d.publicadoEn, version: d.version } : null);
      setFase((f) => (f === "revisando" ? "listo" : f));
      setMensaje(
        d.novedad
          ? `Hay investigaciones nuevas: ${d.periodo} (publicadas el ${fechaBonita(d.publicadoEn)}). Toca el botón para instalarlas.`
          : guardado
            ? `Ya tienes lo más reciente: ${guardado.fuente?.periodo} (datos al ${fechaBonita(guardado.actualizado)}).`
            : "No hay investigaciones instaladas todavía."
      );
    } catch {
      setFase((f) => (f === "revisando" ? "listo" : f));
      setMensaje((m) => (snapshot ? m : "No se pudo revisar en línea. Sigues con lo que ya estaba instalado."));
    }
  }, [snapshot]);

  // Primero se carga lo guardado y lo del despliegue; hasta entonces se revisa el portal.
  useEffect(() => {
    if (cargado) revisar();
  }, [cargado, revisar]);

  /* 3 · el botón: bajar e instalar */
  const instalar = useCallback(async () => {
    if (enCurso.current) return;
    enCurso.current = true;
    setError("");
    setProgreso(0);
    setFase("bajando");
    setMensaje("Bajando las investigaciones más recientes…");
    const tic = setInterval(() => setProgreso((p) => Math.min(p + 6, 85)), 400);

    try {
      const guardado = await leerInvestigaciones();
      let nuevo = null;

      // Primero en vivo (lo más fresco); si falla, se usa el archivo del deploy.
      try {
        const r = await fetch(`${URL_API}?armar=1&max=20000&version=${encodeURIComponent(guardado?.version || "")}`);
        const d = await r.json();
        if (d.ok && d.snapshot) nuevo = d.snapshot;
        else setError(d.detalle || d.error || "");
      } catch (e) {
        setError(String(e?.message || e));
      }

      if (!nuevo) {
        setMensaje("El portal no respondió; instalando las del último despliegue…");
        const r = await fetch(ARCHIVO_DEL_DEPLOY, { cache: "no-store" });
        if (r.ok) nuevo = await r.json();
      }

      clearInterval(tic);
      setProgreso(92);
      if (!nuevo) throw new Error("No fue posible obtener las investigaciones");

      if (guardado && nuevo.version === guardado.version) {
        setFase("listo");
        setProgreso(100);
        setMensaje(`Sin novedades: ya tienes ${guardado.fuente?.periodo} (datos al ${fechaBonita(guardado.actualizado)}).`);
        guardarMeta({ ultimaRevision: Date.now(), novedad: null });
        setNovedad(null);
        return;
      }

      setFase("instalando");
      setMensaje("Guardando en el dispositivo…");
      await guardarInvestigaciones(nuevo);
      guardarMeta({ ultimaRevision: Date.now(), instaladoEn: Date.now(), novedad: null });
      setSnapshot(nuevo);
      setNovedad(null);
      setProgreso(100);
      setFase("listo");
      setMensaje(
        `Listo: ${nuevo.fuente?.periodo} instalado · ${miles(nuevo.cobertura?.registrosProcesados)} precios · ` +
        `${nuevo.porCategoria?.length || 0} categorías · ${nuevo.porCadena?.length || 0} cadenas.`
      );
    } catch (e) {
      clearInterval(tic);
      setFase("error");
      setMensaje("No se pudo actualizar. Lo que ya tenías instalado sigue intacto.");
      setError(String(e?.message || e));
    } finally {
      enCurso.current = false;
    }
  }, []);

  async function olvidar() {
    await borrarInvestigaciones();
    setSnapshot(null);
    setNovedad(null);
    setProgreso(0);
    setFase("listo");
    setMensaje("Investigaciones borradas de este dispositivo. Toca el botón para instalarlas otra vez.");
  }

  const etiqueta = ocupado
    ? fase === "revisando" ? "Revisando…" : fase === "bajando" ? `Bajando… ${progreso}%` : "Instalando…"
    : novedad ? `Instalar investigaciones ${novedad.periodo}`
    : snapshot ? "Investigaciones al día" : "Bajar e instalar investigaciones";

  const estado = novedad && !ocupado ? "success" : ocupado ? "loading" : "idle";
  const topCategorias = (snapshot?.porCategoria || []).slice(0, 5);
  const topCadenas = (snapshot?.porCadena || []).slice(0, 5);

  return (
    <div className="open-data-content">
      <p className="lead" style={{ fontSize: 16 }}>
        Los precios del programa <b>Quién es quién en los precios</b> que PROFECO publica cada mes en
        datos.gob.mx. Se guardan en tu celular y siguen ahí aunque cambie el mes o no haya internet.
      </p>

      <button
        className={`btn btn-primary async-button async-button-${estado}`}
        type="button"
        onClick={instalar}
        disabled={ocupado}
        aria-busy={ocupado}
        data-state={estado}
      >
        <span className="async-button-icon" aria-hidden="true">
          {ocupado ? "" : novedad ? "↓" : snapshot ? "✓" : "↓"}
        </span>
        {etiqueta}
      </button>

      {ocupado && (
        <div className="progress" role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progreso}%` }} />
        </div>
      )}

      <p className="meta" role="status" aria-live="polite" aria-atomic="true">{mensaje}</p>

      {snapshot && (
        <>
          <dl className="datos-grid">
            <div><dt>Periodo</dt><dd>{snapshot.fuente?.periodo}</dd></div>
            <div><dt>Publicado por PROFECO</dt><dd>{fechaBonita(snapshot.fuente?.publicadoEn)}</dd></div>
            <div><dt>Precios levantados al</dt><dd>{fechaBonita(snapshot.actualizado)}</dd></div>
            <div><dt>Precios guardados</dt><dd>{miles(snapshot.cobertura?.registrosProcesados)}</dd></div>
            <div><dt>Categorías / cadenas</dt><dd>{snapshot.porCategoria?.length || 0} / {snapshot.porCadena?.length || 0}</dd></div>
            <div>
              <dt>Rango de precios</dt>
              <dd>
                ${snapshot.cobertura?.precioMin} – ${snapshot.cobertura?.precioMax} (mediana $
                {snapshot.cobertura?.precioMediana})
              </dd>
            </div>
            <div><dt>Versión</dt><dd>{snapshot.version}</dd></div>
          </dl>

          {topCategorias.length > 0 && (
            <>
              <p className="meta" style={{ marginTop: 12, fontWeight: 700 }}>Categorías con más precios</p>
              <ul className="mini-lista">
                {topCategorias.map((c) => (
                  <li key={c.categoria}>
                    <span>{c.categoria}</span>
                    <span className="meta">
                      {miles(c.registros)} · mediana ${c.precioMediana}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {topCadenas.length > 0 && (
            <>
              <p className="meta" style={{ marginTop: 12, fontWeight: 700 }}>Cadenas con más precios</p>
              <ul className="mini-lista">
                {topCadenas.map((c) => (
                  <li key={c.cadena}>
                    <span>{c.cadena}</span>
                    <span className="meta">
                      {miles(c.registros)} · mediana ${c.precioMediana}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {error && <div className="alert" role="alert">Detalle técnico: {error}</div>}

      <div className="pills" style={{ marginTop: 12 }}>
        <button className="btn btn-ghost" type="button" onClick={() => revisar({ forzar: true })} disabled={ocupado}>
          Revisar novedades
        </button>
        {snapshot && (
          <button className="btn btn-ghost" type="button" onClick={olvidar} disabled={ocupado}>
            Borrar del dispositivo
          </button>
        )}
      </div>

      <p className="meta" style={{ marginTop: 12 }}>
        Fuente: {snapshot?.fuente?.portal || "datos.gob.mx"} · {snapshot?.fuente?.programa || "Quién es quién en los precios"} ·
        licencia CC-BY-4.0 · los precios son los que PROFECO publicó, no una cotización en vivo.
      </p>
    </div>
  );
}
