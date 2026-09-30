"use client";

import { useEffect, useState } from "react";

export default function InstalarPage() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const qr = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`
    : "";

  return (
    <main className="wrap">
      <section className="hero">
        <div className="kicker">Instalar en el celular</div>
        <h1 className="screen-title">Queda en tu pantalla de inicio</h1>
        <p className="lead">
          No se descarga de App Store ni Play Store. Se instala desde aquí y se abre
          a pantalla completa, sin la barra del navegador.
        </p>
      </section>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 18 }}>
        <div className="qr-box">
          {qr ? <img src={qr} alt="Código QR de ComparaProfeco" width="240" height="240" /> : <p>Cargando QR…</p>}
          <p className="meta">{url || "Se genera al abrir la app publicada"}</p>
        </div>
        <div className="hero">
          <h2>En iPhone</h2>
          <ol className="steps">
            <li>Abre este sitio en Safari.</li>
            <li>Toca el botón de compartir.</li>
            <li>Elige <b>Agregar a pantalla de inicio</b>.</li>
          </ol>
          <h2>En Android</h2>
          <ol className="steps">
            <li>Abre este sitio en Chrome.</li>
            <li>Toca los tres puntos.</li>
            <li>Elige <b>Instalar aplicación</b> o <b>Agregar a pantalla de inicio</b>.</li>
          </ol>
        </div>
      </div>

      <div className="alert" style={{ marginTop: 18 }}>
        El QR apunta a la dirección pública de Vercel. Mientras uses la app en tu computadora
        en modo local, el QR no servirá para el resto de la familia. Primero hay que publicarla.
      </div>
    </main>
  );
}
