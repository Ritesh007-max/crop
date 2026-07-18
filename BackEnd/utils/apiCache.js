const apiCache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

/**
 * A simple fetch wrapper that caches successful JSON responses in memory.
 * Returns a Response-like object with an `ok` flag and a `json()` method.
 */
async function fetchWithCache(url, options = {}) {
  const now = Date.now();
  
  if (apiCache.has(url)) {
    const cached = apiCache.get(url);
    if (now - cached.timestamp < CACHE_TTL) {
      return {
        ok: true,
        json: async () => cached.data
      };
    }
    apiCache.delete(url);
  }

  const response = await fetch(url, options);
  
  if (response.ok) {
    const data = await response.json();
    apiCache.set(url, { timestamp: now, data });
    return {
      ok: true,
      json: async () => data
    };
  }

  return response;
}

module.exports = { fetchWithCache };
