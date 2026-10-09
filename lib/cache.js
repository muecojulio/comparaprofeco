/**
 * Caché en memoria del servidor con tope de entradas.
 * El tope evita que alguien llene la memoria con claves nuevas (p. ej. variando
 * parámetros de búsqueda). Al pasar el tope se descarta la entrada más antigua.
 */
const MAX_ENTRADAS = 200;
const store = new Map();

function guardar(key, ttlMs, value) {
  store.delete(key);
  store.set(key, { exp: Date.now() + ttlMs, value });
  while (store.size > MAX_ENTRADAS) {
    store.delete(store.keys().next().value);
  }
  return value;
}

/**
 * Devuelve el valor cacheado o llama `fn`. Si `fn` es asíncrona, la promesa se
 * guarda de inmediato: las peticiones simultáneas comparten la misma consulta
 * (evita golpear el portal varias veces por la misma clave).
 */
export function cached(key, ttlMs, fn) {
  const hit = store.get(key);
  if (hit && hit.exp > Date.now()) return hit.value;

  const value = fn();
  if (value && typeof value.then === "function") {
    guardar(key, ttlMs, value);
    value.catch(() => {
      // Si falla no se queda cacheado el error: la próxima petición reintenta.
      if (store.get(key)?.value === value) store.delete(key);
    });
    return value;
  }
  return guardar(key, ttlMs, value);
}
