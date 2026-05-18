import { useEffect, useState } from "react";
import { videoDB, IDB_PREFIX } from "./videoDB";

/**
 * Resolves a video reference to a usable src string for a <video> element.
 *
 * - Regular URLs (http, https, /path) and data: URLs: returned synchronously.
 * - idb:// references: resolved from IndexedDB asynchronously.
 *   Returns undefined until resolved, then the Object URL.
 *   Object URL is revoked automatically on cleanup or when ref changes.
 */
export function useVideoUrl(ref: string | undefined): string | undefined {
  const isIdb = !!ref?.startsWith(IDB_PREFIX);

  const [url, setUrl] = useState<string | undefined>(
    isIdb ? undefined : (ref || undefined)
  );

  useEffect(() => {
    if (!ref) { setUrl(undefined); return; }
    if (!ref.startsWith(IDB_PREFIX)) { setUrl(ref); return; }

    let objectUrl: string | null = null;
    let cancelled = false;

    videoDB.resolve(ref).then((resolved) => {
      if (cancelled) {
        if (resolved) URL.revokeObjectURL(resolved);
        return;
      }
      objectUrl = resolved;
      setUrl(resolved ?? undefined);
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };
  }, [ref]);

  return url;
}
