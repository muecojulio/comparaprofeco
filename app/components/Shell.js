"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/explorar", label: "Ramos", icon: "▦" },
  { href: "/fuentes", label: "Fuentes", icon: "ⓘ" },
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
      <header className="appbar">
        <a className="brand" href="/">
          <span className="brand-mark">CP</span>
          <span>
            <b>ComparaProfeco</b>
            <small>App familiar</small>
          </span>
        </a>
      </header>
      <div className="screen">{children}</div>
      <nav className="tabbar" aria-label="Navegación de la app">
        {TABS.map((t) => {
          const on =
            t.href === "/"
              ? path === "/"
              : path === t.href || path.startsWith(`${t.href}/`);
          return (
            <a key={t.href} href={t.href} className={on ? "on" : ""}>
              <span className="ticon">{t.icon}</span>
              {t.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
