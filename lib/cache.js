const store = new Map();

export function cached(key, ttlMs, fn) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.exp > now) return hit.value;
  const value = fn();
  if (value && typeof value.then === "function") {
    return value.then((v) => {
      store.set(key, { exp: Date.now() + ttlMs, value: v });
      return v;
    });
  }
  store.set(key, { exp: now + ttlMs, value });
  return value;
}

export function bust(prefix) {
  for (const k of store.keys()) {
    if (!prefix || k.startsWith(prefix)) store.delete(k);
  }
}
