"use client";

import { useState, useEffect, useRef } from "react";
import { BilingualField } from "@/admin/components/BilingualField";
import { ImageUpload } from "@/admin/components/ImageUpload";
import { VideoUpload } from "@/admin/components/VideoUpload";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { StatusBadge } from "@/admin/components/StatusBadge";
import type { PortfolioItem, PortfolioCategory, GalleryItem } from "@/store/types";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Save, Star, Film, Image, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES: PortfolioCategory[] = ["branding", "social", "content", "ads", "offline"];

const newGalleryItem = (order: number): GalleryItem => ({
  id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  type: "image",
  src: "",
  poster: "",
  alt: { en: "", ar: "" },
  caption: { en: "", ar: "" },
  order,
});

const empty = (): PortfolioItem => ({
  id: `p_${Date.now()}`,
  slug: "",
  title: { en: "", ar: "" },
  category: "branding",
  mediaType: "image",
  coverImage: "",
  coverVideo: "",
  videoPoster: "",
  image: "",
  type: "image",
  video: "",
  impact: { en: "", ar: "" },
  challenge: { en: "", ar: "" },
  strategy: { en: "", ar: "" },
  execution: { en: "", ar: "" },
  result: { en: "", ar: "" },
  gallery: [],
  featured: false,
  active: true,
  order: 99,
});

const inputCls =
  "w-full h-10 rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50";

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const { url } = await res.json();
  return url;
};

export default function PortfolioManagerPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedGallery, setExpandedGallery] = useState<Set<string>>(new Set());
  const multiUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const persist = async (data: PortfolioItem[]) => {
    setItems(data);
    await fetch("/api/portfolio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const startEdit = (item?: PortfolioItem) => {
    setEditing(item ? { ...item, gallery: item.gallery ?? [] } : empty());
    setExpandedGallery(new Set());
  };
  const cancelEdit = () => { setEditing(null); setExpandedGallery(new Set()); };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    // Sync legacy fields so old readers still work
    const record: PortfolioItem = {
      ...editing,
      image: editing.coverImage,
      type: editing.mediaType,
      video: editing.coverVideo || undefined,
    };
    const exists = items.find((p) => p.id === record.id);
    await persist(exists ? items.map((p) => (p.id === record.id ? record : p)) : [...items, record]);
    setSaving(false);
    toast.success("Project saved!");
    cancelEdit();
  };

  const remove = async (id: string) => {
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setItems(items.filter((p) => p.id !== id));
    toast.success("Project deleted.");
  };

  const toggle = (id: string) => persist(items.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  const setFeatured = (id: string) => persist(items.map((p) => ({ ...p, featured: p.id === id })));
  const move = (id: string, dir: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((p) => p.id === id);
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    [sorted[idx].order, sorted[target].order] = [sorted[target].order, sorted[idx].order];
    persist(sorted);
  };

  // Gallery helpers
  const gallery = editing?.gallery ?? [];

  const addGalleryItem = (type: "image" | "video") => {
    if (!editing) return;
    setEditing({ ...editing, gallery: [...gallery, { ...newGalleryItem(gallery.length), type }] });
  };

  const updateGalleryItem = (id: string, updates: Partial<GalleryItem>) => {
    if (!editing) return;
    setEditing({ ...editing, gallery: gallery.map((g) => (g.id === id ? { ...g, ...updates } : g)) });
  };

  const removeGalleryItem = (id: string) => {
    if (!editing) return;
    setEditing({ ...editing, gallery: gallery.filter((g) => g.id !== id) });
    setExpandedGallery((s) => { const n = new Set(s); n.delete(id); return n; });
  };

  const moveGalleryItem = (id: string, dir: "up" | "down") => {
    if (!editing) return;
    const sorted = [...gallery].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((g) => g.id === id);
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    [sorted[idx].order, sorted[target].order] = [sorted[target].order, sorted[idx].order];
    setEditing({ ...editing, gallery: sorted });
  };

  const toggleGalleryExpand = (id: string) =>
    setExpandedGallery((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const files = Array.from(e.target.files ?? [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 20);
    if (!files.length) return;
    let nextOrder = gallery.length;
    const newItems: GalleryItem[] = [];
    for (const file of files) {
      try {
        const url = await uploadImage(file);
        newItems.push({
          id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type: "image",
          src: url,
          poster: "",
          alt: { en: "", ar: "" },
          caption: { en: "", ar: "" },
          order: nextOrder++,
        });
      } catch {
        // skip failed uploads
      }
    }
    if (newItems.length > 0) {
      setEditing((prev) => (prev ? { ...prev, gallery: [...(prev.gallery ?? []), ...newItems] } : prev));
    }
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  // ── Editor ────────────────────────────────────────────────────────────────

  if (editing) {
    const sortedGallery = [...gallery].sort((a, b) => a.order - b.order);

    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">{editing.slug ? "Edit Project" : "New Project"}</h1>
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">
              Cancel
            </button>
            <button onClick={saveEdit} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Save className="size-4" />{saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Basic fields */}
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Slug (URL)</label>
              <input
                type="text"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="project-slug"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Category</label>
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as PortfolioCategory })} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Order</label>
              <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>
          <BilingualField label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} required />
          <BilingualField label="Impact / Overview" value={editing.impact} onChange={(v) => setEditing({ ...editing, impact: v })} multiline rows={2} />
        </div>

        {/* Main Media */}
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Main Media</p>

          {/* Media type selector */}
          <div>
            <label className="mb-2 block text-xs text-white/50">Main Media Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing({ ...editing, mediaType: "image", type: "image" })}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  editing.mediaType === "image"
                    ? "border-primary bg-primary/10 text-white"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                )}
              >
                <Image className="size-4" /> Image
              </button>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, mediaType: "video", type: "video" })}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  editing.mediaType === "video"
                    ? "border-primary bg-primary/10 text-white"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                )}
              >
                <Film className="size-4" /> Video
              </button>
            </div>
          </div>

          {editing.mediaType === "image" ? (
            <ImageUpload
              label="Cover Image"
              value={editing.coverImage}
              onChange={(v) => setEditing({ ...editing, coverImage: v, image: v })}
            />
          ) : (
            <>
              <VideoUpload
                label="Cover Video"
                value={editing.coverVideo ?? ""}
                onChange={(v) => setEditing({ ...editing, coverVideo: v, video: v || undefined })}
              />
              <ImageUpload
                label="Video Poster (thumbnail shown before video loads or if video fails)"
                value={editing.videoPoster ?? ""}
                onChange={(v) => setEditing({ ...editing, videoPoster: v })}
              />
            </>
          )}
        </div>

        {/* Gallery */}
        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Gallery ({sortedGallery.length})
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => multiUploadRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
              >
                <Image className="size-3.5" /> Multi-upload images
              </button>
              <button
                type="button"
                onClick={() => addGalleryItem("image")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
              >
                <Image className="size-3.5" /> + Image
              </button>
              <button
                type="button"
                onClick={() => addGalleryItem("video")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
              >
                <Film className="size-3.5" /> + Video
              </button>
            </div>
          </div>
          <input
            ref={multiUploadRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg"
            multiple
            onChange={handleMultiUpload}
            className="hidden"
          />

          {sortedGallery.length === 0 && (
            <p className="py-6 text-center text-xs text-white/30">No gallery items yet. Add images or videos above.</p>
          )}

          {sortedGallery.map((item, idx) => {
            const isExpanded = expandedGallery.has(item.id);
            return (
              <div key={item.id} className="rounded-xl border border-white/8 bg-[#0D0D0D]">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveGalleryItem(item.id, "up")} disabled={idx === 0} className="text-white/20 hover:text-white/60 disabled:opacity-20">
                      <ChevronUp className="size-3" />
                    </button>
                    <button type="button" onClick={() => moveGalleryItem(item.id, "down")} disabled={idx === sortedGallery.length - 1} className="text-white/20 hover:text-white/60 disabled:opacity-20">
                      <ChevronDown className="size-3" />
                    </button>
                  </div>
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-[#1A1A1A]">
                    {item.type === "image" && item.src ? (
                      <img src={item.src} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                    ) : item.type === "video" ? (
                      <div className="flex h-full items-center justify-center"><Film className="size-4 text-white/30" /></div>
                    ) : (
                      <div className="flex h-full items-center justify-center"><Image className="size-4 text-white/30" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold capitalize text-white/60">{item.type} #{idx + 1}</p>
                    {item.caption?.en && <p className="truncate text-[10px] text-white/30">{item.caption.en}</p>}
                  </div>
                  <button type="button" onClick={() => toggleGalleryExpand(item.id)} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8 hover:text-white">
                    <ChevronRight className={cn("size-3.5 transition-transform duration-200", isExpanded && "rotate-90")} />
                  </button>
                  <button type="button" onClick={() => removeGalleryItem(item.id)} className="rounded-lg p-1.5 text-red-400/30 hover:bg-red-500/10 hover:text-red-400">
                    <X className="size-3.5" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/8 p-4 space-y-4">
                    {item.type === "image" ? (
                      <ImageUpload label="Image" value={item.src} onChange={(v) => updateGalleryItem(item.id, { src: v })} />
                    ) : (
                      <>
                        <VideoUpload label="Video" value={item.src} onChange={(v) => updateGalleryItem(item.id, { src: v })} />
                        <ImageUpload label="Video Poster" value={item.poster ?? ""} onChange={(v) => updateGalleryItem(item.id, { poster: v })} />
                      </>
                    )}
                    <BilingualField label="Caption" value={item.caption ?? { en: "", ar: "" }} onChange={(v) => updateGalleryItem(item.id, { caption: v })} multiline rows={2} />
                    <BilingualField label="Alt Text" value={item.alt ?? { en: "", ar: "" }} onChange={(v) => updateGalleryItem(item.id, { alt: v })} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Case study */}
        <details className="rounded-2xl border border-white/8 bg-[#111111] p-6">
          <summary className="cursor-pointer text-xs font-semibold text-white/50">Case Study Details (optional)</summary>
          <div className="mt-4 space-y-4">
            <BilingualField label="Challenge" value={editing.challenge ?? { en: "", ar: "" }} onChange={(v) => setEditing({ ...editing, challenge: v })} multiline rows={2} />
            <BilingualField label="Strategy" value={editing.strategy ?? { en: "", ar: "" }} onChange={(v) => setEditing({ ...editing, strategy: v })} multiline rows={2} />
            <BilingualField label="Execution" value={editing.execution ?? { en: "", ar: "" }} onChange={(v) => setEditing({ ...editing, execution: v })} multiline rows={2} />
            <BilingualField label="Result" value={editing.result ?? { en: "", ar: "" }} onChange={(v) => setEditing({ ...editing, result: v })} multiline rows={2} />
          </div>
        </details>

        <div className="rounded-2xl border border-white/8 bg-[#111111] p-6">
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="size-4 rounded accent-primary" />
              <span className="text-sm text-white/70">Active</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="size-4 rounded accent-primary" />
              <span className="text-sm text-white/70">Featured (shown first)</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  const sorted = [...items].sort((a, b) => a.order - b.order);
  const filtered = filterCat === "all" ? sorted : sorted.filter((p) => p.category === filterCat);

  return (
    <div className="p-6 space-y-6 md:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="mt-1 text-sm text-white/45">{items.length} projects · {items.filter((p) => p.active).length} active</p>
        </div>
        <button onClick={() => startEdit()} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
          <Plus className="size-4" /> Add Project
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={cn("rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-all", filterCat === cat ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-white/40 hover:border-white/20 hover:text-white")}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((project) => (
          <div key={project.id} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#111111] px-5 py-4">
            <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-[#1A1A1A]">
              {project.coverImage && (
                <img src={project.coverImage} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-white">{project.title.en}</p>
                {project.featured && <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-white/40">
                <span className="capitalize">{project.category}</span>
                <span>·</span>
                <span>/{project.slug}</span>
                {project.mediaType === "video" && (
                  <span className="flex items-center gap-1 text-primary/60">
                    <Film className="size-3" /> video
                  </span>
                )}
                {(project.gallery?.length ?? 0) > 0 && (
                  <span className="text-white/30">{project.gallery!.length} in gallery</span>
                )}
              </div>
            </div>
            <StatusBadge status={project.active ? "active" : "inactive"} />
            <div className="flex items-center gap-1">
              <button onClick={() => move(project.id, "up")} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8"><ChevronUp className="size-3.5" /></button>
              <button onClick={() => move(project.id, "down")} className="rounded-lg p-1.5 text-white/30 hover:bg-white/8"><ChevronDown className="size-3.5" /></button>
              {!project.featured && (
                <button onClick={() => setFeatured(project.id)} title="Set as featured" className="rounded-lg p-1.5 text-amber-400/40 hover:bg-amber-400/10 hover:text-amber-400">
                  <Star className="size-3.5" />
                </button>
              )}
              <button onClick={() => toggle(project.id)} className={cn("rounded-lg px-2 py-1 text-[10px] font-semibold", project.active ? "text-white/40 hover:text-amber-400" : "text-primary")}>
                {project.active ? "Hide" : "Show"}
              </button>
              <button onClick={() => startEdit(project)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white"><Pencil className="size-3.5" /></button>
              <button onClick={() => setDeleteTarget(project.id)} className="rounded-lg p-1.5 text-red-400/40 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message="This will remove the project from the portfolio. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
