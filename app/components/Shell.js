"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/explorar", label: "Ramos", icon: "▦" },
  { href: "/fuentes", label: "Fuentes", icon: "ⓘ" },
  { href: "/instalar", label: "Instalar", icon: "⇩" },
  { href: "/privacidad", label: "Privacidad", icon: "⚿" }
];

export default function Shell({ children }) {
  const path = usePathname() || "/";

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

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
        className="tabbar"
        aria-label="Navegación de la app"
        style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)` }}
      >
        {TABS.map((t) => {
          const on =
            t.href === "/"
              ? path === "/"
              : path === t.href || path.startsWith(`${t.href}/`);
          return (
            <a
              key={t.href}
              href={t.href}
              className={on ? "on" : ""}
              aria-current={on ? "page" : undefined}
            >
              <span className="ticon" aria-hidden="true">{t.icon}</span>
              {t.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
