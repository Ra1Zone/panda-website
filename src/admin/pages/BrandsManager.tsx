import { useState } from "react";
import { brandsStore } from "@/store/dataStore";
import { BilingualField } from "@/admin/components/BilingualField";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { StatusBadge } from "@/admin/components/StatusBadge";
import type { Brand } from "@/store/types";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save } from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full h-10 rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50";

const empty = (): Brand => ({
  id: `b_${Date.now()}`,
  name: "",
  logo: "",
  category: { en: "", ar: "" },
  story: { en: "", ar: "" },
  active: true,
  order: 99,
});

const BrandsManager = () => {
  const [items, setItems] = useState<Brand[]>(() => brandsStore.getAll());
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const persist = (data: Brand[]) => { brandsStore.save(data); setItems(data); };
  const startEdit = (item?: Brand) => setEditing(item ? { ...item } : empty());
  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    const exists = items.find((b) => b.id === editing.id);
    persist(exists ? items.map((b) => (b.id === editing.id ? editing : b)) : [...items, editing]);
    setSaving(false);
    toast.success("Brand saved!");
    cancelEdit();
  };

  const remove = (id: string) => { persist(items.filter((b) => b.id !== id)); toast.success("Brand deleted."); };
  const toggle = (id: string) => persist(items.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  const move = (id: string, dir: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((b) => b.id === id);
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    [sorted[idx].order, sorted[target].order] = [sorted[target].order, sorted[idx].order];
    persist(sorted);
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{editing.name ? "Edit Brand" : "New Brand"}</h1>
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
            <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Save className="size-4" />{saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Brand Name</label>
            <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Acme Corp" className={inputCls} required />
          </div>
          <ImageUpload
            label="Logo (SVG or image)"
            value={editing.logo}
            onChange={(v) => setEditing({ ...editing, logo: v })}
            accept="image/*,.svg"
          />
          <BilingualField label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} />
          <BilingualField label="Story / Work Description" value={editing.story} onChange={(v) => setEditing({ ...editing, story: v })} />
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="size-4 rounded accent-primary" />
              <span className="text-sm text-white/70">Active (show in marquee)</span>
            </label>
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
          <h1 className="text-2xl font-bold text-white">Brands & Clients</h1>
          <p className="mt-1 text-sm text-white/45">{items.length} brands · {items.filter((b) => b.active).length} shown in marquee</p>
        </div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> Add Brand
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((brand) => (
          <div key={brand.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#111111] p-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = "none")} />
              ) : (
                <span className="text-xs font-bold text-white/30">{brand.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate">{brand.name}</p>
              <p className="text-xs text-white/40 truncate">{brand.category.en}</p>
            </div>
            <div className="flex items-center gap-1">
              <StatusBadge status={brand.active ? "active" : "inactive"} />
              <button onClick={() => move(brand.id, "up")} className="rounded-lg p-1 text-white/30 hover:bg-white/8"><ChevronUp className="size-3" /></button>
              <button onClick={() => move(brand.id, "down")} className="rounded-lg p-1 text-white/30 hover:bg-white/8"><ChevronDown className="size-3" /></button>
              <button onClick={() => toggle(brand.id)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white text-[10px] font-semibold">{brand.active ? "Hide" : "Show"}</button>
              <button onClick={() => startEdit(brand)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white"><Pencil className="size-3.5" /></button>
              <button onClick={() => setDeleteTarget(brand.id)} className="rounded-lg p-1.5 text-red-400/40 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Brand"
        message="Remove this brand from the website?"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default BrandsManager;
