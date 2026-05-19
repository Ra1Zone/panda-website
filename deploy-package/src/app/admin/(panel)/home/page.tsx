"use client";

import { useState, useEffect } from "react";
import { BilingualField } from "@/admin/components/BilingualField";
import { ImageUpload } from "@/admin/components/ImageUpload";
import type { HomeContent, StatItem, HeroStrategyTab, HeroCampaignItem } from "@/store/types";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full h-10 rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-white/8 bg-[#111111] p-6">
    <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/50">{title}</h2>
    <div className="space-y-5">{children}</div>
  </section>
);

const defaultHome: HomeContent = {
  heroBadge: { en: "", ar: "" },
  heroTitleBefore: { en: "", ar: "" },
  heroTitleHighlight: { en: "", ar: "" },
  heroTitleAfter: { en: "", ar: "" },
  heroSubtitle: { en: "", ar: "" },
  heroPrimaryCtaLabel: { en: "", ar: "" },
  heroPrimaryCtaHref: "",
  heroSecondaryCtaLabel: { en: "", ar: "" },
  heroSecondaryCtaHref: "",
  heroStrategyTabs: [],
  heroMainImage: "",
  heroSecondaryImage: "",
  heroBottomImage: "",
  heroCampaignRoomLabel: { en: "", ar: "" },
  heroCampaignItems: [],
  heroBottomBarText: { en: "", ar: "" },
  heroSignalLabel: { en: "", ar: "" },
  heroSignalTitle: { en: "", ar: "" },
  statsEyebrow: { en: "", ar: "" },
  statsHeadline: { en: "", ar: "" },
  stats: [],
  finalCtaTitle: { en: "", ar: "" },
  finalCtaSub: { en: "", ar: "" },
};

export default function HomeEditorPage() {
  const [data, setData] = useState<HomeContent>(defaultHome);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((d) => {
        setData({ ...defaultHome, ...d });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Home content saved!");
    } catch {
      toast.error("Failed to save home content.");
    } finally {
      setSaving(false);
    }
  };

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const updateTab = (id: string, patch: Partial<HeroStrategyTab>) =>
    setData((p) => ({ ...p, heroStrategyTabs: p.heroStrategyTabs.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  const addTab = () =>
    setData((p) => ({
      ...p,
      heroStrategyTabs: [...p.heroStrategyTabs, { id: `tab_${Date.now()}`, title: { en: "Tab", ar: "تبويب" }, number: String(p.heroStrategyTabs.length + 1).padStart(2, "0") }],
    }));
  const removeTab = (id: string) =>
    setData((p) => ({ ...p, heroStrategyTabs: p.heroStrategyTabs.filter((t) => t.id !== id) }));

  // ── Campaign Items ───────────────────────────────────────────────────────────
  const updateCampaignItem = (id: string, patch: Partial<HeroCampaignItem>) =>
    setData((p) => ({ ...p, heroCampaignItems: p.heroCampaignItems.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addCampaignItem = () =>
    setData((p) => ({
      ...p,
      heroCampaignItems: [...p.heroCampaignItems, { id: `c_${Date.now()}`, title: { en: "New item", ar: "عنصر جديد" }, number: String(p.heroCampaignItems.length + 1).padStart(2, "0") }],
    }));
  const removeCampaignItem = (id: string) =>
    setData((p) => ({ ...p, heroCampaignItems: p.heroCampaignItems.filter((c) => c.id !== id) }));

  // ── Stats ────────────────────────────────────────────────────────────────────
  const updateStat = (id: string, field: Partial<StatItem>) =>
    setData((prev) => ({ ...prev, stats: prev.stats.map((s) => (s.id === id ? { ...s, ...field } : s)) }));
  const addStat = () =>
    setData((prev) => ({ ...prev, stats: [...prev.stats, { id: `stat_${Date.now()}`, value: 0, label: { en: "New Stat", ar: "إحصائية جديدة" } }] }));
  const removeStat = (id: string) =>
    setData((prev) => ({ ...prev, stats: prev.stats.filter((s) => s.id !== id) }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Home Page</h1>
          <p className="mt-1 text-sm text-white/45">Edit hero content, statistics, and CTAs</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Badge */}
      <Section title="Hero Badge">
        <BilingualField label="Badge Text" value={data.heroBadge} onChange={(v) => setData((p) => ({ ...p, heroBadge: v }))} />
      </Section>

      {/* Title */}
      <Section title="Hero Title (3-Part Structure)">
        <p className="text-xs text-white/35">The H1 renders as: [Before] <span className="text-primary">[Highlight]</span> [After]</p>
        <BilingualField label="Before (plain text)" value={data.heroTitleBefore} onChange={(v) => setData((p) => ({ ...p, heroTitleBefore: v }))} />
        <BilingualField label="Highlight (green gradient)" value={data.heroTitleHighlight} onChange={(v) => setData((p) => ({ ...p, heroTitleHighlight: v }))} />
        <BilingualField label="After (plain text)" value={data.heroTitleAfter} onChange={(v) => setData((p) => ({ ...p, heroTitleAfter: v }))} multiline rows={2} />
      </Section>

      {/* Subtitle */}
      <Section title="Hero Subtitle">
        <BilingualField label="Subtitle" value={data.heroSubtitle} onChange={(v) => setData((p) => ({ ...p, heroSubtitle: v }))} multiline rows={3} />
      </Section>

      {/* CTAs */}
      <Section title="Call-to-Action Buttons">
        <BilingualField label="Primary Button Label" value={data.heroPrimaryCtaLabel} onChange={(v) => setData((p) => ({ ...p, heroPrimaryCtaLabel: v }))} />
        <div>
          <label className="mb-1 block text-xs text-white/40">Primary Button Link</label>
          <input type="text" value={data.heroPrimaryCtaHref} onChange={(e) => setData((p) => ({ ...p, heroPrimaryCtaHref: e.target.value }))} placeholder="/contact" className={inputCls} />
        </div>
        <BilingualField label="Secondary Button Label" value={data.heroSecondaryCtaLabel} onChange={(v) => setData((p) => ({ ...p, heroSecondaryCtaLabel: v }))} />
        <div>
          <label className="mb-1 block text-xs text-white/40">Secondary Button Link</label>
          <input type="text" value={data.heroSecondaryCtaHref} onChange={(e) => setData((p) => ({ ...p, heroSecondaryCtaHref: e.target.value }))} placeholder="/portfolio" className={inputCls} />
        </div>
      </Section>

      {/* Strategy Tabs */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Strategy Tabs (bottom of title column)</h2>
          <button type="button" onClick={addTab} className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
            <Plus className="size-3.5" /> Add Tab
          </button>
        </div>
        <div className="space-y-4">
          {(data.heroStrategyTabs ?? []).map((tab) => (
            <div key={tab.id} className="rounded-xl border border-white/8 bg-[#0E0E0E] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/40">Tab</span>
                <button type="button" onClick={() => removeTab(tab.id)} className="rounded-lg p-1 text-red-400/50 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-[10px] text-white/40">Number Label</label>
                <input type="text" value={tab.number} onChange={(e) => updateTab(tab.id, { number: e.target.value })} placeholder="01" className={inputCls} />
              </div>
              <BilingualField label="Tab Title" value={tab.title} onChange={(v) => updateTab(tab.id, { title: v })} />
            </div>
          ))}
        </div>
      </section>

      {/* Hero Images */}
      <Section title="Hero Images">
        <ImageUpload label="Main Image (large, top-left)" value={data.heroMainImage} onChange={(v) => setData((p) => ({ ...p, heroMainImage: v }))} />
        <ImageUpload label="Secondary Image (top-right)" value={data.heroSecondaryImage} onChange={(v) => setData((p) => ({ ...p, heroSecondaryImage: v }))} />
        <ImageUpload label="Bottom Image (bottom-left)" value={data.heroBottomImage} onChange={(v) => setData((p) => ({ ...p, heroBottomImage: v }))} />
      </Section>

      {/* Campaign Room */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Campaign Room Card</h2>
          <button type="button" onClick={addCampaignItem} className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
            <Plus className="size-3.5" /> Add Item
          </button>
        </div>
        <div className="space-y-5">
          <BilingualField label="Card Label" value={data.heroCampaignRoomLabel} onChange={(v) => setData((p) => ({ ...p, heroCampaignRoomLabel: v }))} />
          <div className="space-y-4">
            {(data.heroCampaignItems ?? []).map((item) => (
              <div key={item.id} className="rounded-xl border border-white/8 bg-[#0E0E0E] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/40">Item</span>
                  <button type="button" onClick={() => removeCampaignItem(item.id)} className="rounded-lg p-1 text-red-400/50 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="mb-3">
                  <label className="mb-1 block text-[10px] text-white/40">Number</label>
                  <input type="text" value={item.number} onChange={(e) => updateCampaignItem(item.id, { number: e.target.value })} placeholder="01" className={inputCls} />
                </div>
                <BilingualField label="Item Title" value={item.title} onChange={(v) => updateCampaignItem(item.id, { title: v })} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Bar & Signal Card */}
      <Section title="Floating UI Elements">
        <BilingualField label="Bottom Bar Text" value={data.heroBottomBarText} onChange={(v) => setData((p) => ({ ...p, heroBottomBarText: v }))} />
        <BilingualField label="Signal Card Label" value={data.heroSignalLabel} onChange={(v) => setData((p) => ({ ...p, heroSignalLabel: v }))} />
        <BilingualField label="Signal Card Title" value={data.heroSignalTitle} onChange={(v) => setData((p) => ({ ...p, heroSignalTitle: v }))} />
      </Section>

      {/* Stats */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Statistics Section</h2>
          <button type="button" onClick={addStat} className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
            <Plus className="size-3.5" /> Add Stat
          </button>
        </div>
        <div className="space-y-5">
          <BilingualField label="Stats Eyebrow" value={data.statsEyebrow} onChange={(v) => setData((p) => ({ ...p, statsEyebrow: v }))} />
          <BilingualField label="Stats Headline" value={data.statsHeadline} onChange={(v) => setData((p) => ({ ...p, statsHeadline: v }))} multiline rows={2} />
          <div className="space-y-4">
            {(data.stats ?? []).map((stat) => (
              <div key={stat.id} className="rounded-xl border border-white/8 bg-[#0E0E0E] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/40">Stat</span>
                  <button type="button" onClick={() => removeStat(stat.id)} className="rounded-lg p-1 text-red-400/50 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[10px] text-white/40">Value</label>
                    <input type="number" value={stat.value} onChange={(e) => updateStat(stat.id, { value: Number(e.target.value) })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-white/40">Prefix</label>
                    <input type="text" value={stat.prefix ?? ""} onChange={(e) => updateStat(stat.id, { prefix: e.target.value || undefined })} placeholder="+" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-white/40">Suffix</label>
                    <input type="text" value={stat.suffix ?? ""} onChange={(e) => updateStat(stat.id, { suffix: e.target.value || undefined })} placeholder="M+" className={inputCls} />
                  </div>
                </div>
                <div className="mt-3">
                  <BilingualField label="Label" value={stat.label} onChange={(v) => updateStat(stat.id, { label: v })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <Section title="Final CTA Section">
        <BilingualField label="CTA Title" value={data.finalCtaTitle} onChange={(v) => setData((p) => ({ ...p, finalCtaTitle: v }))} multiline rows={2} />
        <BilingualField label="CTA Subtitle" value={data.finalCtaSub} onChange={(v) => setData((p) => ({ ...p, finalCtaSub: v }))} multiline rows={2} />
      </Section>
    </div>
  );
}
