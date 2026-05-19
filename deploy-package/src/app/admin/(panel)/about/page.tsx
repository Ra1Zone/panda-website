"use client";

import { useState, useEffect } from "react";
import { BilingualField } from "@/admin/components/BilingualField";
import { ImageUpload } from "@/admin/components/ImageUpload";
import type { AboutContent } from "@/store/types";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const defaultAbout: AboutContent = {
  heroTitle: { en: "", ar: "" },
  heroSubtitle: { en: "", ar: "" },
  storyText: { en: "", ar: "" },
  mission: { en: "", ar: "" },
  vision: { en: "", ar: "" },
  values: [],
  teamImage: "",
};

export default function AboutEditorPage() {
  const [data, setData] = useState<AboutContent>(defaultAbout);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((d) => {
        setData({ ...defaultAbout, ...d });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("About page saved!");
    } catch {
      toast.error("Failed to save about page.");
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (i: number, field: "en" | "ar", val: string) => {
    const values = [...data.values];
    values[i] = { ...values[i], [field]: val };
    setData((p) => ({ ...p, values }));
  };

  const addValue = () => setData((p) => ({ ...p, values: [...p.values, { en: "", ar: "" }] }));
  const removeValue = (i: number) => setData((p) => ({ ...p, values: p.values.filter((_, idx) => idx !== i) }));

  const inputCls = "w-full h-10 rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50";

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
          <h1 className="text-2xl font-bold text-white">About Page</h1>
          <p className="mt-1 text-sm text-white/45">Edit agency story, mission, vision, and values</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Hero */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Hero Section</h2>
        <BilingualField label="Hero Title" value={data.heroTitle} onChange={(v) => setData((p) => ({ ...p, heroTitle: v }))} multiline rows={2} required />
        <BilingualField label="Hero Subtitle" value={data.heroSubtitle} onChange={(v) => setData((p) => ({ ...p, heroSubtitle: v }))} multiline rows={3} />
        <ImageUpload label="Team / Studio Image" value={data.teamImage} onChange={(v) => setData((p) => ({ ...p, teamImage: v }))} />
      </section>

      {/* Story */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Our Story</h2>
        <BilingualField label="Story Text" value={data.storyText} onChange={(v) => setData((p) => ({ ...p, storyText: v }))} multiline rows={5} />
      </section>

      {/* Mission & Vision */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Mission & Vision</h2>
        <BilingualField label="Mission" value={data.mission} onChange={(v) => setData((p) => ({ ...p, mission: v }))} multiline rows={2} />
        <BilingualField label="Vision" value={data.vision} onChange={(v) => setData((p) => ({ ...p, vision: v }))} multiline rows={2} />
      </section>

      {/* Values */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Core Values</h2>
          <button onClick={addValue} className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
            <Plus className="size-3.5" /> Add Value
          </button>
        </div>
        {data.values.map((v, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="text"
              value={v.en}
              onChange={(e) => updateValue(i, "en", e.target.value)}
              placeholder="Value (English)"
              className={`${inputCls} flex-1`}
              dir="ltr"
            />
            <input
              type="text"
              value={v.ar}
              onChange={(e) => updateValue(i, "ar", e.target.value)}
              placeholder="القيمة (عربي)"
              className={`${inputCls} flex-1`}
              dir="rtl"
            />
            <button onClick={() => removeValue(i)} className="shrink-0 rounded-lg p-2 text-red-400/50 hover:bg-red-500/10 hover:text-red-400">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
