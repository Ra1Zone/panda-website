import { defaultHomeContent } from "./defaults";
import type { HomeContent } from "./types";

// Coerces a BilingualText field — accepts any shape, falls back to defaults
function normBilingual(val: unknown, fallback: { en: string; ar: string }) {
  if (val && typeof val === "object") {
    const v = val as Record<string, unknown>;
    if (typeof v.en === "string" || typeof v.ar === "string") {
      return {
        en: typeof v.en === "string" ? v.en : fallback.en,
        ar: typeof v.ar === "string" ? v.ar : fallback.ar,
      };
    }
  }
  return { en: fallback.en, ar: fallback.ar };
}

function normString(val: unknown, fallback: string): string {
  return typeof val === "string" ? val : fallback;
}

// Ensures the value is an array — returns a copy of fallback if not
function normArray<T>(val: unknown, fallback: T[]): T[] {
  return Array.isArray(val) ? (val as T[]) : fallback.map((x) => ({ ...(x as object) }) as T);
}

/**
 * Normalizes any raw (possibly incomplete/outdated) stored home data
 * into a full valid HomeContent object. Safe to call with undefined/null/old data.
 */
export function normalizeHomeContent(raw: unknown): HomeContent {
  const d = defaultHomeContent;

  if (!raw || typeof raw !== "object") {
    return structuredCloneHomeDefaults(d);
  }

  const r = raw as Record<string, unknown>;

  return {
    heroBadge: normBilingual(r.heroBadge, d.heroBadge),
    heroTitleBefore: normBilingual(r.heroTitleBefore, d.heroTitleBefore),
    heroTitleHighlight: normBilingual(r.heroTitleHighlight, d.heroTitleHighlight),
    heroTitleAfter: normBilingual(r.heroTitleAfter, d.heroTitleAfter),
    heroSubtitle: normBilingual(r.heroSubtitle, d.heroSubtitle),
    heroPrimaryCtaLabel: normBilingual(r.heroPrimaryCtaLabel, d.heroPrimaryCtaLabel),
    heroPrimaryCtaHref: normString(r.heroPrimaryCtaHref, d.heroPrimaryCtaHref),
    heroSecondaryCtaLabel: normBilingual(r.heroSecondaryCtaLabel, d.heroSecondaryCtaLabel),
    heroSecondaryCtaHref: normString(r.heroSecondaryCtaHref, d.heroSecondaryCtaHref),
    heroStrategyTabs: normArray(r.heroStrategyTabs, d.heroStrategyTabs),
    heroMainImage: normString(r.heroMainImage, d.heroMainImage),
    heroSecondaryImage: normString(r.heroSecondaryImage, d.heroSecondaryImage),
    heroBottomImage: normString(r.heroBottomImage, d.heroBottomImage),
    heroCampaignRoomLabel: normBilingual(r.heroCampaignRoomLabel, d.heroCampaignRoomLabel),
    heroCampaignItems: normArray(r.heroCampaignItems, d.heroCampaignItems),
    heroBottomBarText: normBilingual(r.heroBottomBarText, d.heroBottomBarText),
    heroSignalLabel: normBilingual(r.heroSignalLabel, d.heroSignalLabel),
    heroSignalTitle: normBilingual(r.heroSignalTitle, d.heroSignalTitle),
    statsEyebrow: normBilingual(r.statsEyebrow, d.statsEyebrow),
    statsHeadline: normBilingual(r.statsHeadline, d.statsHeadline),
    stats: normArray(r.stats, d.stats),
    servicesHeadline: normBilingual(r.servicesHeadline, d.servicesHeadline ?? { en: "", ar: "" }),
    finalCtaTitle: normBilingual(r.finalCtaTitle, d.finalCtaTitle),
    finalCtaSub: normBilingual(r.finalCtaSub, d.finalCtaSub),
  };
}

function structuredCloneHomeDefaults(d: HomeContent): HomeContent {
  return {
    ...d,
    heroStrategyTabs: d.heroStrategyTabs.map((t) => ({ ...t, title: { ...t.title } })),
    heroCampaignItems: d.heroCampaignItems.map((c) => ({ ...c, title: { ...c.title } })),
    stats: d.stats.map((s) => ({ ...s, label: { ...s.label } })),
  };
}
