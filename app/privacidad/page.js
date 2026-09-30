export const metadata = {
  title: "Política de privacidad · ComparaProfeco"
};

export default function PrivacidadPage() {
  return (
    <main className="wrap">
      <section className="hero">
        <div className="kicker">Aviso</div>
        <h1>Política de privacidad</h1>
        <p className="lead">
          ComparaProfeco resume estudios públicos de Profeco. No es un sitio oficial.
          Actualizado el 30 de septiembre de 2026.
        </p>
      </section>
      <article className="hero" style={{ marginTop: 16 }}>
        <h2>Qué datos usamos</h2>
        <p>
          No pedimos cuenta, correo ni tarjeta. No hay cookies de publicidad. El
          service worker guarda páginas e iconos en tu dispositivo para abrir la app
          sin red.
        </p>
        <h2>Qué sale de tu teléfono</h2>
        <ul>
          <li>Búsquedas opcionales a Open Food Facts y datos.gob.mx (APIs públicas, sin tu nombre).</li>
          <li>Imágenes ilustrativas de Pollinations si cargas una ficha de producto.</li>
          <li>El QR de instalación se genera en un servicio público de códigos QR con la URL de la app.</li>
        </ul>
        <h2>Lo que no hacemos</h2>
        <p>
          No vendemos datos. No rastreamos a otras personas. No enviamos el
          historial de navegación a un servidor propio.
        </p>
        <h2>Contacto</h2>
        <p>
          Para ejercer derechos ARCO sobre cualquier dato que hayas escrito tú en
          un comentario o correo, usa los canales oficiales de Profeco si el tema
          es un estudio, o elimina la app y el almacenamiento del sitio en tu
          navegador.
        </p>
        <p className="meta">
          Fuentes oficiales: gob.mx/profeco · datos.gob.mx · revistadelconsumidor.profeco.gob.mx
        </p>
      </article>
    </main>
  );
}
