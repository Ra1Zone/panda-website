import type { BilingualText, Lang } from "@/store/types";

type LocalizedText = Partial<Record<Lang, string>> & { en?: string; ar?: string; he?: string };
type LocalizedArray = Partial<Record<"en" | "ar" | "he", string[]>>;

const hebrewTranslationCache = new Map<string, string>();
const hebrewTranslationRequests = new Set<string>();
const translationSubscribers = new Set<() => void>();

const cacheKey = (source: string) => `he:${source}`;

const cleanString = (value: unknown): string => {
  if (typeof value !== "string") return "";
  return value.trim() ? value : "";
};

export function registerHebrewTranslations(entries: Record<string, string>) {
  Object.entries(entries).forEach(([source, translated]) => {
    const sourceText = cleanString(source);
    const translatedText = sanitizeHebrew(cleanString(translated));
    if (sourceText && translatedText) {
      hebrewTranslationCache.set(cacheKey(sourceText), translatedText);
    }
  });
}

export function subscribeToTranslationUpdates(listener: () => void) {
  translationSubscribers.add(listener);
  return () => {
    translationSubscribers.delete(listener);
  };
}

const notifyTranslationSubscribers = () => {
  translationSubscribers.forEach((listener) => listener());
};

const sanitizeHebrew = (value: string) => value.replace(/\bפנדה\b/g, "Panda");

const shouldAutoTranslate = (value: string) => {
  if (!value || value.length > 900) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (/^[\d\s+().,%:/#-]+$/.test(value)) return false;
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value)) return false;
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return false;
  if (/\.(jpg|jpeg|png|webp|gif|svg|mp4|mov|pdf)$/i.test(value)) return false;
  return true;
};

const requestHebrewTranslation = (source: string) => {
  const key = cacheKey(source);
  if (hebrewTranslationCache.has(key) || hebrewTranslationRequests.has(key) || !shouldAutoTranslate(source)) return;

  hebrewTranslationRequests.add(key);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=he&dt=t&q=${encodeURIComponent(source)}`;

  fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Translation failed"))))
    .then((data) => {
      const translated = Array.isArray(data?.[0])
        ? data[0].map((part: unknown[]) => (Array.isArray(part) ? part[0] : "")).join("")
        : "";
      const cleanTranslated = sanitizeHebrew(cleanString(translated));
      if (cleanTranslated) {
        hebrewTranslationCache.set(key, cleanTranslated);
        notifyTranslationSubscribers();
      }
    })
    .catch(() => {
      // English remains the visible fallback when remote translation is unavailable.
    })
    .finally(() => {
      hebrewTranslationRequests.delete(key);
    });
};

export function translateToHebrew(source: unknown, fallback = ""): string {
  const sourceText = cleanString(source);
  if (!sourceText) return cleanString(fallback);

  const cached = hebrewTranslationCache.get(cacheKey(sourceText));
  if (cached) return cached;

  const fallbackText = cleanString(fallback);
  if (fallbackText) {
    const sanitizedFallback = sanitizeHebrew(fallbackText);
    hebrewTranslationCache.set(cacheKey(sourceText), sanitizedFallback);
    return sanitizedFallback;
  }

  requestHebrewTranslation(sourceText);
  return sourceText;
}

export function getLocalizedText(field: string | LocalizedText | Array<string | LocalizedText> | undefined | null, lang: Lang, fallback = ""): string {
  if (Array.isArray(field)) {
    return field.map((item) => getLocalizedText(item, lang)).filter(Boolean).join(", ");
  }

  if (typeof field === "string") {
    return lang === "he" ? translateToHebrew(field, fallback) : field || fallback;
  }

  if (!field || typeof field !== "object") return fallback || "";

  const en = cleanString(field.en);
  const ar = cleanString(field.ar);

  if (lang === "ar") return ar || en || fallback || "";
  if (lang === "he") return translateToHebrew(en || fallback || ar, cleanString(field.he));
  return en || ar || fallback || "";
}

export function getLocalized(field: BilingualText | string | undefined | null, lang: Lang, fallback = ""): string {
  return getLocalizedText(field, lang, fallback);
}

export function getLocalizedArray(
  field: LocalizedArray | Array<string | LocalizedText> | undefined | null,
  lang: Lang,
): string[] {
  if (!field) return [];
  if (Array.isArray(field)) {
    return field.map((item) => getLocalizedText(item, lang)).filter(Boolean);
  }

  const en = Array.isArray(field.en) ? field.en : [];
  const ar = Array.isArray(field.ar) ? field.ar : [];
  const he = Array.isArray(field.he) ? field.he : [];

  if (lang === "ar") return (ar.length > 0 ? ar : en).filter(Boolean);
  if (lang === "he") {
    return en.map((item, index) => translateToHebrew(item, he[index])).filter(Boolean);
  }
  return (en.length > 0 ? en : ar).filter(Boolean);
}
