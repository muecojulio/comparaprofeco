# ComparaProfeco

App familiar con estudios publicados de la Revista del Consumidor (Profeco).
No es un sitio oficial.

Node.js: **24.x** (`engines` en package.json y `.nvmrc`).

## Verificación

```sh
npm ci
npm run check # npm audit + compilación de producción
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
- Índices en memoria (id, ramo, año): no hay base SQL
- Caché: service worker + memoria del servidor + headers
- Política de privacidad
- APIs públicas sin key: datos.gob.mx y Open Food Facts
- Pollinations y QR Server se mantienen

## API local

- `GET /api/catalogo?ramo=&anio=`
- `GET /api/featured`
- `GET /api/datos-abiertos?q=profeco`
- `GET /api/openfoodfacts?q=atun`

## Publicar

Repo privado en GitHub. En Vercel: Import → Next.js → Deploy.
Plan Hobby solo para uso personal.
