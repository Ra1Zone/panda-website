// Centralized localStorage abstraction.
// Replace get/set calls with API calls here when a backend is added.

const PREFIX = "panda_";

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v !== null ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent(`panda-store-update-${key}`));
    } catch (e) {
      console.error("[panda-store] write error:", e);
    }
  },

  del(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },
};
