"use client";

import { useState, useEffect } from "react";
import { BilingualField } from "@/admin/components/BilingualField";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { StatusBadge } from "@/admin/components/StatusBadge";
import type { ServiceItem } from "@/store/types";
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronUp, Save, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "list" | "edit";

const ICONS = ["MonitorSmartphone", "Sparkles", "Layers", "LineChart", "Megaphone", "Compass", "Brush", "Target"];

const emptyService = (): ServiceItem => ({
  id: `svc_${Date.now()}`,
  slug: "",
  number: "01",
  icon: "Sparkles",
  image: "",
  title: { en: "", ar: "" },
  desc: { en: "", ar: "" },
  note: { en: "", ar: "" },
  tags: { en: [""], ar: [""] },
  bullets: { en: [""], ar: [""] },
  bestFor: { en: [""], ar: [""] },
  featured: false,
  active: true,
  order: 99,
});

const inputCls =
  "w-full h-10 rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50";

const ArrayField = ({
  label,
  enItems,
  arItems,
  onEnChange,
  onArChange,
}: {
  label: string;
  enItems: string[];
  arItems: string[];
  onEnChange: (v: string[]) => void;
  onArChange: (v: string[]) => void;
}) => {
  const max = Math.max(enItems.length, arItems.length);
  const rows = Array.from({ length: max }, (_, i) => i);

  const updateEn = (i: number, v: string) => {
    const arr = [...enItems];
    arr[i] = v;
    onEnChange(arr);
  };
  const updateAr = (i: number, v: string) => {
    const arr = [...arItems];
    arr[i] = v;
    onArChange(arr);
  };
  const addRow = () => {
    onEnChange([...enItems, ""]);
    onArChange([...arItems, ""]);
  };
  const removeRow = (i: number) => {
    onEnChange(enItems.filter((_, idx) => idx !== i));
    onArChange(arItems.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
        <button type="button" onClick={addRow} className="text-[10px] text-primary hover:underline">+ Add item</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">EN</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70">AR</p>
      </div>
      {rows.map((i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={enItems[i] ?? ""}
            onChange={(e) => updateEn(i, e.target.value)}
            placeholder="English"
            className={`${inputCls} flex-1`}
            dir="ltr"
          />
          <input
            type="text"
            value={arItems[i] ?? ""}
            onChange={(e) => updateAr(i, e.target.value)}
            placeholder="Arabic"
            className={`${inputCls} flex-1`}
            dir="rtl"
          />
          <button type="button" onClick={() => removeRow(i)} className="shrink-0 rounded-lg p-2 text-red-400/50 hover:bg-red-500/10 hover:text-red-400">
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function ServicesManagerPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const persist = async (items: ServiceItem[]) => {
    setServices(items);
    await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
  };

  const startEdit = (service?: ServiceItem) => {
    setEditing(service ? { ...service } : emptyService());
    setMode("edit");
  };

  const cancelEdit = () => {
    setEditing(null);
    setMode("list");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const exists = services.find((s) => s.id === editing.id);
    const updated = exists
      ? services.map((s) => (s.id === editing.id ? editing : s))
      : [...services, editing];
    await persist(updated);
    setSaving(false);
    toast.success("Service saved!");
    cancelEdit();
  };

  const deleteService = async (id: string) => {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    toast.success("Service deleted.");
  };

  const toggle = (id: string) => {
    persist(services.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const move = (id: string, dir: "up" | "down") => {
    const sorted = [...services].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s.id === id);
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    [sorted[idx].order, sorted[target].order] = [sorted[target].order, sorted[idx].order];
    persist(sorted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  if (mode === "edit" && editing) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{editing.slug ? "Edit Service" : "New Service"}</h1>
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
            <button
              onClick={saveEdit}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Number (e.g. 01)</label>
              <input type="text" value={editing.number} onChange={(e) => setEditing({ ...editing, number: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Slug (URL-safe)</label>
              <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Icon</label>
              <select value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className={inputCls}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <BilingualField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} required />
          <BilingualField label="Description" value={editing.desc} onChange={(v) => setEditing({ ...editing, desc: v })} multiline rows={3} />
          <BilingualField label="Short Note (card)" value={editing.note} onChange={(v) => setEditing({ ...editing, note: v })} multiline rows={2} />
          <ImageUpload label="Service Image" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} />
          <ArrayField
            label="Tags"
            enItems={editing.tags.en}
            arItems={editing.tags.ar}
            onEnChange={(v) => setEditing({ ...editing, tags: { ...editing.tags, en: v } })}
            onArChange={(v) => setEditing({ ...editing, tags: { ...editing.tags, ar: v } })}
          />
          <ArrayField
            label="Bullets (What we do)"
            enItems={editing.bullets.en}
            arItems={editing.bullets.ar}
            onEnChange={(v) => setEditing({ ...editing, bullets: { ...editing.bullets, en: v } })}
            onArChange={(v) => setEditing({ ...editing, bullets: { ...editing.bullets, ar: v } })}
          />
          <ArrayField
            label="Best For"
            enItems={editing.bestFor.en}
            arItems={editing.bestFor.ar}
            onEnChange={(v) => setEditing({ ...editing, bestFor: { ...editing.bestFor, en: v } })}
            onArChange={(v) => setEditing({ ...editing, bestFor: { ...editing.bestFor, ar: v } })}
          />
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="size-4 rounded accent-primary" />
              <span className="text-sm text-white/70">Active (visible on website)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.featured ?? false} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="size-4 rounded accent-primary" />
              <span className="text-sm text-white/70">Featured (shown as hero card on home page)</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...services].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 space-y-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="mt-1 text-sm text-white/45">{services.length} services · {services.filter((s) => s.active).length} active</p>
        </div>
        <button
          onClick={() => startEdit()}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Service
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((service) => (
          <div key={service.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#111111] px-5 py-4">
            <GripVertical className="size-4 shrink-0 text-white/20" />
            <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-[#1A1A1A]">
              {service.image && (
                <img src={service.image} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate">{service.title.en}</p>
              <p className="mt-0.5 text-xs text-white/40 truncate">{service.title.ar}</p>
            </div>
            <StatusBadge status={service.active ? "active" : "inactive"} />
            <div className="flex items-center gap-1">
              <button onClick={() => move(service.id, "up")} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8 hover:text-white">
                <ChevronUp className="size-3.5" />
              </button>
              <button onClick={() => move(service.id, "down")} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8 hover:text-white">
                <ChevronDown className="size-3.5" />
              </button>
              <button onClick={() => toggle(service.id)} className={cn("rounded-lg p-1.5 text-xs font-semibold transition-colors", service.active ? "text-white/40 hover:text-amber-400" : "text-primary hover:text-primary/80")}>
                {service.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => startEdit(service)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white">
                <Pencil className="size-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(service.id)} className="rounded-lg p-1.5 text-red-400/40 hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Service"
        message="This will remove the service from the website. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteService(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
