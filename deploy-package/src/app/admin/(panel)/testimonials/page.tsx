"use client";

import { useState, useEffect } from "react";
import { BilingualField } from "@/admin/components/BilingualField";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { StatusBadge } from "@/admin/components/StatusBadge";
import type { Testimonial } from "@/store/types";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save } from "lucide-react";
import { toast } from "sonner";

const empty = (): Testimonial => ({
  id: `t_${Date.now()}`,
  quote: { en: "", ar: "" },
  author: { en: "", ar: "" },
  role: { en: "", ar: "" },
  active: true,
  order: 99,
});

export default function TestimonialsManagerPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const persist = async (data: Testimonial[]) => {
    setItems(data);
    await fetch("/api/testimonials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const startEdit = (item?: Testimonial) => setEditing(item ? { ...item } : empty());
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const exists = items.find((t) => t.id === editing.id);
    await persist(exists ? items.map((t) => (t.id === editing.id ? editing : t)) : [...items, editing]);
    setSaving(false);
    toast.success("Testimonial saved!");
    cancelEdit();
  };

  const remove = async (id: string) => {
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    setItems(items.filter((t) => t.id !== id));
    toast.success("Deleted.");
  };

  const toggle = (id: string) => persist(items.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  const move = (id: string, dir: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((t) => t.id === id);
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

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{editing.quote.en ? "Edit Testimonial" : "New Testimonial"}</h1>
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
            <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Save className="size-4" />{saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
          <BilingualField label="Quote" value={editing.quote} onChange={(v) => setEditing({ ...editing, quote: v })} multiline rows={4} required />
          <BilingualField label="Author Name" value={editing.author} onChange={(v) => setEditing({ ...editing, author: v })} required />
          <BilingualField label="Role / Position" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} required />
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="size-4 rounded accent-primary" />
              <span className="text-sm text-white/70">Active</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Order:</span>
              <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className="w-20 h-8 rounded-lg border border-white/10 bg-[#111111] px-2 text-sm text-white outline-none" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 space-y-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="mt-1 text-sm text-white/45">{items.length} total · {items.filter((t) => t.active).length} active</p>
        </div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> Add Testimonial
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/8 bg-[#111111] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 line-clamp-2 italic">&quot;{item.quote.en}&quot;</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {item.author.en.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.author.en}</p>
                    <p className="text-xs text-white/40">{item.role.en}</p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusBadge status={item.active ? "active" : "inactive"} />
                <button onClick={() => move(item.id, "up")} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8"><ChevronUp className="size-3.5" /></button>
                <button onClick={() => move(item.id, "down")} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8"><ChevronDown className="size-3.5" /></button>
                <button onClick={() => toggle(item.id)} className="rounded-lg px-2 py-1 text-[10px] font-semibold text-white/40 hover:text-primary">
                  {item.active ? "Hide" : "Show"}
                </button>
                <button onClick={() => startEdit(item)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white"><Pencil className="size-3.5" /></button>
                <button onClick={() => setDeleteTarget(item.id)} className="rounded-lg p-1.5 text-red-400/40 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Testimonial"
        message="This will permanently remove this testimonial."
        onConfirm={() => deleteTarget && remove(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
