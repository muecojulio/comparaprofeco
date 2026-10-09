# ComparaProfeco

App familiar con estudios publicados de la Revista del Consumidor (Profeco).
No es un sitio oficial.

Node.js: **24.x** (`engines` en package.json y `.nvmrc`).

## Interacciones (sistema reutilizable)

Todo el comportamiento táctil y accesible vive en piezas compartidas; ninguna
pantalla inventa sus propias reglas ni se agregaron dependencias:

| Pieza | Para qué |
|---|---|
| `lib/usePress.js` | Hundimiento al presionar y tilt 3D discreto (≤ 1.2°) en tarjetas. Sólo con ratón/pluma; con `prefers-reduced-motion` no hace nada. |
| `app/components/Superficie.js` | Superficie pulsable (`as="a" \| "article" \| "li"`) que ya usan las tarjetas del catálogo, las fichas y los analizados guardados. |
| `app/components/AsyncButton.js` | Único botón asíncrono: `idle → loading → success / error`, `aria-busy`, anti doble envío y vibración opcional al confirmar. |
| `app/components/TabSwipePanel.js` | Paneles de pestañas con gesto horizontal (umbral 1.2, 52 px o 28 px rápidos), cruce de 220 ms y teclado. Ignora los gestos que nacen sobre controles. |
| `app/components/Avisos.js` + `lib/anuncios.js` | Avisos breves (`role="status"`) con autocierre, pausa al pasar el puntero y acción “Deshacer”. |
| `app/components/OverflowRail.js` | Carruseles: desplazamiento con snap, bordes difuminados y flechas ← → de teclado. |
| `app/components/SegmentedTabs.js` | Pestañas ARIA con indicador deslizante, centrado del activo y flechas/Inicio/Fin en el `tablist`. |

Tokens de movimiento en `:root` (`app/globals.css`): `--dur-1`, `--dur-2`,
`--ease`, `--press-scale`, `--press-lift`, `--press-shadow`, `--tilt`.
Con `prefers-reduced-motion: reduce` se apagan animaciones, tilt y arrastre, y
el gesto sigue cambiando de panel.

## Vida visual

Ideas tomadas de repos públicos (MIT) como referencia: aurora animada
([mattnewdavid/animated-aurora-gradient-css](https://github.com/mattnewdavid/animated-aurora-gradient-css)),
gradientes animados de [LunarLogic/auroral](https://github.com/LunarLogic/auroral) y la
colección [refusado/awesome-css-only](https://github.com/refusado/awesome-css-only).
El CSS es propio y vive en la sección "Vida visual" de `app/globals.css`.

- Fondo con aurora que flota muy despacio y textura de puntos.
- Franja de avisos que corre sola (inicio).
- Héroe con calcomanías flotantes y título con brillo.
- Cada ramo tiene su color (`colores` en `lib/data.js`): tarjetas, chips y héroe lo usan.
- Borde de color que gira en el “producto analizado de hoy”.
- Fichas con franja del nivel de evaluación.
- Todo el movimiento decorativo se apaga con `prefers-reduced-motion`.

## Seguridad

- **Cabeceras** (`next.config.mjs`): Content-Security-Policy con sólo los orígenes que usa la app
  (Google Fonts, Pollinations, QR Server), HSTS, COOP, `frame-ancestors` y `form-action` restringidos.
- **APIs**: `q` validado (letras, números, espacios y guiones; máx. 80), tope fijo de 20 mil
  registros en `armar=1` (ya no acepta `max`), caché con tope de entradas y peticiones simultáneas
  compartidas, y errores sin detalle técnico hacia el navegador.
- **Service worker**: sólo guarda recursos del mismo origen, nunca APIs ni terceros.
- **Código muerto retirado**: endpoints sin uso (`/api/catalogo`, `/api/openfoodfacts`), módulos
  vacíos (`lib/extras*.js`) y funciones sin llamadas.
- Política de privacidad actualizada en `/privacidad`.

## Verificación

```sh
npm ci
npm run check # npm audit (nivel low) + compilación de producción
```

## Incluye

- 6 ramos y catálogo 2024 + 2025 + 2026
- Filtros por ramo y año (2024 / 2025 / 2026 / todo el periodo)
- Fuentes con PDFs de los tres años
- Producto analizado del día (rotación automática)
- **Analizados guardados**: al abrir el producto del día queda guardado en el dispositivo,
  dentro de su ramo (pestaña Ramos) y de su categoría (ficha del estudio), aunque cambie el día
- Pestañas: Inicio · Ramos · Fuentes · **Instalar** · Privacidad (instalar y privacidad ya no
  se repiten en el menú de Inicio)
- Índice en memoria por ramo: no hay base SQL
- Caché: service worker + memoria del servidor + headers
- Política de privacidad
- API pública sin key: datos.gob.mx (consultada desde el servidor)
- **Precios al día (Quién es quién)**: botón que baja e instala las investigaciones mensuales
  de PROFECO y las guarda en el dispositivo (IndexedDB), con resumen por categoría y cadena
- Un GitHub Action revisa el portal a diario y actualiza el archivo cuando hay algo nuevo
- Pollinations y QR Server se mantienen

## API local

- `GET /api/featured`
- `GET /api/datos-abiertos?q=profeco&rows=8` (q: letras, números, espacios y guiones; máx. 80)
- `GET /api/actualizar?solo=verificar&version=<hash>` — ¿PROFECO publicó algo nuevo?
- `GET /api/actualizar?armar=1` — arma el resumen de precios en vivo desde el portal (tope fijo de 20 mil registros)

## Precios de PROFECO

```sh
npm run datos     # genera public/data/profeco-latest.json (20 mil precios del mes más reciente)
```

El archivo se regenera solo en cada `npm run build` y en el Action diario
(`.github/workflows/actualizar-profeco.yml`). Fuente: datos.gob.mx, licencia CC-BY-4.0.

## Publicar

Repo privado en GitHub. En Vercel: Import → Next.js → Deploy.
Plan Hobby solo para uso personal.
