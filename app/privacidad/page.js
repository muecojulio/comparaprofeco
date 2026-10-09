export const metadata = {
  title: "Política de privacidad · ComparaProfeco",
  description: "Qué datos guarda ComparaProfeco, qué servicios externos consulta y cómo borrarlos."
};

export default function PrivacidadPage() {
  return (
    <main className="wrap">
      <section className="hero hero-viva">
        <div className="kicker">Aviso de privacidad</div>
        <h1>Política de privacidad</h1>
        <p className="lead">
          ComparaProfeco es un proyecto independiente que resume estudios públicos de la
          Revista del Consumidor. No es un sitio oficial de Profeco.
        </p>
        <p className="meta">Última actualización: 9 de octubre de 2026</p>
      </section>

      <article className="hero aviso-articulo">
        <h2>Resumen corto</h2>
        <ul>
          <li>No pedimos cuenta, correo, nombre ni tarjeta.</li>
          <li>No usamos cookies de rastreo, publicidad ni analítica.</li>
          <li>Lo que guardas (analizados, precios descargados) vive sólo en tu navegador.</li>
          <li>No vendemos ni compartimos datos personales.</li>
        </ul>

        <h2>1. Datos que se guardan en tu dispositivo</h2>
        <p>
          La app usa el almacenamiento de tu navegador. Ese contenido nunca se envía a
          nuestros servidores:
        </p>
        <ul>
          <li>
            <b>Analizados guardados</b> (localStorage): el producto que abriste, su estudio y
            la fecha en que lo abriste. Se conservan los 40 más recientes.
          </li>
          <li>
            <b>Precios al día</b> (IndexedDB, con respaldo en localStorage): el resumen de las
            investigaciones de precios que decidiste instalar, y la fecha de tu última revisión.
          </li>
          <li>
            <b>Producto del día</b> (sessionStorage): sólo dura mientras la pestaña está abierta.
          </li>
          <li>
            <b>Páginas sin conexión</b> (service worker): copias de las pantallas propias de la
            app para abrirlas sin red. No incluye datos de terceros.
          </li>
        </ul>

        <h2>2. Servicios externos</h2>
        <p>Algunas partes de la app piden contenido a terceros. Cada uno recibe sólo lo necesario:</p>
        <ul>
          <li>
            <b>Google Fonts</b> (fonts.googleapis.com, fonts.gstatic.com): sirve la tipografía.
            Tu navegador se conecta a Google, que puede registrar tu dirección IP y tu
            navegador según sus políticas.
          </li>
          <li>
            <b>Pollinations</b> (image.pollinations.ai): genera las fotos ilustrativas de las
            fichas. La dirección de la imagen incluye la marca y el nombre del producto; no
            incluye datos personales.
          </li>
          <li>
            <b>QR Server</b> (api.qrserver.com): en la pantalla Instalar, genera el código QR
            con la dirección pública de la app.
          </li>
          <li>
            <b>datos.gob.mx</b> (Plataforma Nacional de Datos Abiertos): la app consulta
            el portal desde nuestro servidor, no desde tu navegador. Así tu dirección IP no
            llega al portal. Si el portal no responde, el servidor puede usar una copia de
            lectura pública (r.jina.ai) y, si ese servicio tampoco está disponible, se muestra
            un catálogo de respaldo incluido en la app.
          </li>
        </ul>

        <h2>3. Alojamiento y registros técnicos</h2>
        <p>
          La app se aloja en Vercel. Como cualquier sitio web, el proveedor de alojamiento
          puede registrar datos técnicos de cada visita (dirección IP, fecha, página
          solicitada) según sus propias políticas. ComparaProfeco no agrega herramientas
          de analítica ni perfiles de usuario.
        </p>

        <h2>4. Seguridad</h2>
        <ul>
          <li>Conexión cifrada (HTTPS) con HSTS.</li>
          <li>
            Política de contenido restrictiva: la página sólo carga recursos de los orígenes
            listados arriba, no admite incrustarse en otros sitios y no permite formularios
            hacia otros dominios.
          </li>
          <li>No hay formularios de registro ni base de datos con datos de personas.</li>
          <li>Las dependencias se revisan con <code>npm audit</code> antes de cada publicación.</li>
        </ul>

        <h2>5. Lo que no hacemos</h2>
        <p>
          No vendemos datos, no creamos perfiles, no rastreamos tu actividad entre sitios y no
          enviamos tu historial de uso a un servidor propio. No recopilamos datos de menores de
          edad a sabiendas.
        </p>

        <h2>6. Tus controles</h2>
        <ul>
          <li>Quita un analizado desde la pestaña Ramos o desde su estudio.</li>
          <li>Borra los datos del sitio desde la configuración de tu navegador para eliminar todo lo guardado.</li>
          <li>Desinstala la app desde la pantalla de inicio de tu teléfono para quitar la copia sin conexión.</li>
        </ul>
        <p>
          Como no tenemos cuenta ni datos personales en nuestros servidores, no hay expedientes
          que consultar, corregir o cancelar (derechos ARCO). Si tu duda es sobre un estudio
          o un resultado, usa los canales oficiales de Profeco.
        </p>

        <h2>7. Cambios a esta política</h2>
        <p>
          Si algo cambia (por ejemplo, un nuevo servicio externo), actualizaremos esta página y
          la fecha de arriba. Revísala cuando lo necesites.
        </p>

        <p className="meta">
          Fuentes oficiales: gob.mx/profeco · datos.gob.mx · revistadelconsumidor.profeco.gob.mx
        </p>
      </article>
    </main>
  );
}
