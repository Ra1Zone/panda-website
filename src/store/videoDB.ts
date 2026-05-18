// IndexedDB storage for video blobs.
// Stores raw Blob objects — no base64 encoding, no localStorage size limits.
// Returns idb:// reference strings that are resolved to Object URLs at render time.

const DB_NAME = "panda_media";
const STORE = "videos";
const VERSION = 1;

export const IDB_PREFIX = "idb://";

let _db: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

export const videoDB = {
  /**
   * Store a video Blob in IndexedDB.
   * Returns an "idb://<id>" reference string to save in the project record.
   */
  async save(file: File | Blob): Promise<string> {
    const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return `${IDB_PREFIX}${id}`;
  },

  /**
   * Resolve a reference to a usable URL:
   * - Regular URLs (http/https, /path, data:) are returned as-is.
   * - idb:// references are fetched from IndexedDB and an Object URL is created.
   *   Caller is responsible for revoking the Object URL when done.
   * - Returns null if the blob is missing from IDB.
   */
  async resolve(ref: string): Promise<string | null> {
    if (!ref) return null;
    if (!ref.startsWith(IDB_PREFIX)) return ref;
    const id = ref.slice(IDB_PREFIX.length);
    const db = await getDB();
    return new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(id);
      req.onsuccess = () => {
        const blob: Blob | undefined = req.result;
        resolve(blob ? URL.createObjectURL(blob) : null);
      };
      req.onerror = () => resolve(null);
    });
  },

  /**
   * Delete a stored video by its idb:// reference.
   * No-op for regular URLs.
   */
  async remove(ref: string): Promise<void> {
    if (!ref.startsWith(IDB_PREFIX)) return;
    const id = ref.slice(IDB_PREFIX.length);
    const db = await getDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
  },
};
