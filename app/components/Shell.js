"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Avisos from "./Avisos";

const TABS = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/explorar", label: "Ramos", icon: "▦" },
  { href: "/fuentes", label: "Fuentes", icon: "ⓘ" },
  { href: "/instalar", label: "Instalar", icon: "⇩" },
  { href: "/privacidad", label: "Privacidad", icon: "⚿" }
];

export default function Shell({ children }) {
  const path = usePathname() || "/";
  const navRef = useRef(null);
  const enlacesRef = useRef({});
  const [indicador, setIndicador] = useState({ left: 0, width: 0, medido: false });

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const activo =
    TABS.find((t) =>
      t.href === "/" ? path === "/" : path === t.href || path.startsWith(`${t.href}/`)
    ) || TABS[0];

  // La píldora de la sección activa se mide una vez y luego sólo se desliza
  // (mismo truco que ya usa `SegmentedTabs` para su indicador).
  const medir = useCallback(() => {
    const enlace = enlacesRef.current[activo.href];
    if (!enlace) return;
    setIndicador({ left: enlace.offsetLeft, width: enlace.offsetWidth, medido: true });
  }, [activo.href]);

  useEffect(() => {
    medir();
    if (typeof ResizeObserver === "undefined" || !navRef.current) return undefined;
    const observador = new ResizeObserver(medir);
    observador.observe(navRef.current);
    for (const enlace of Object.values(enlacesRef.current)) {
      if (enlace) observador.observe(enlace);
    }
    return () => observador.disconnect();
  }, [medir, path]);

  return (
    <div className="phone">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>
      <header className="appbar">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">CP</span>
          <span>
            <b>ComparaProfeco</b>
            <small>App familiar</small>
          </span>
        </a>
      </header>
      <div className="screen" id="main-content" tabIndex={-1}>{children}</div>
      <nav
        ref={navRef}
        className="tabbar"
        aria-label="Navegación de la app"
        style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)` }}
      >
        <span
          className="tabbar-indicador"
          aria-hidden="true"
          style={{
            width: `${indicador.width}px`,
            transform: `translateX(${indicador.left}px)`,
            opacity: indicador.medido ? 1 : 0
          }}
        />
        {TABS.map((t) => {
          const on =
            t.href === "/"
              ? path === "/"
              : path === t.href || path.startsWith(`${t.href}/`);
          return (
            <a
              key={t.href}
              href={t.href}
              ref={(nodo) => {
                if (nodo) enlacesRef.current[t.href] = nodo;
                else delete enlacesRef.current[t.href];
              }}
              className={on ? "on" : ""}
              aria-current={on ? "page" : undefined}
            >
              <span className="ticon" aria-hidden="true">{t.icon}</span>
              {t.label}
            </a>
          );
        })}
      </nav>
      <Avisos />
    </div>
  );
}
