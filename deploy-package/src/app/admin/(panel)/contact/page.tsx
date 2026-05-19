"use client";

import { useState, useEffect } from "react";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { StatusBadge } from "@/admin/components/StatusBadge";
import type { ContactSubmission } from "@/store/types";
import { Trash2, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "replied">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => {
        setSubmissions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: ContactSubmission["status"]) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      toast.success(`Marked as ${status}.`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/contact/${id}`, { method: "DELETE" });
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Submission deleted.");
    } catch {
      toast.error("Failed to delete submission.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  const filtered = filter === "all" ? submissions : submissions.filter((s) => s.status === filter);
  const newCount = submissions.filter((s) => s.status === "new").length;

  const statusCls = (s: ContactSubmission["status"]) =>
    s === "new" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" :
    s === "replied" ? "bg-primary/12 text-primary border-primary/20" :
    "bg-white/5 text-white/40 border-white/10";

  return (
    <div className="p-6 space-y-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Contact Submissions</h1>
        <p className="mt-1 text-sm text-white/45">
          {submissions.length} total · {newCount > 0 && <span className="text-blue-400">{newCount} new</span>}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "new", "read", "replied"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
              filter === f ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-white/40 hover:border-white/20"
            }`}
          >
            {f}
            {f === "new" && newCount > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-500/30 px-1.5 py-0.5 text-[10px] text-blue-400">{newCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-[#111111] px-6 py-16 text-center">
          <p className="text-white/40">No submissions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div key={sub.id} className="rounded-2xl border border-white/8 bg-[#111111] overflow-hidden">
              <div
                className="flex cursor-pointer items-center gap-4 p-5 hover:bg-white/3"
                onClick={() => {
                  setExpanded(expanded === sub.id ? null : sub.id);
                  if (sub.status === "new") updateStatus(sub.id, "read");
                }}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-bold text-white/60">
                  {sub.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">{sub.name}</p>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-white/40 truncate">{sub.email} · {new Date(sub.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(sub.id); }}
                    className="rounded-lg p-1.5 text-red-400/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  {expanded === sub.id ? <ChevronUp className="size-4 text-white/30" /> : <ChevronDown className="size-4 text-white/30" />}
                </div>
              </div>

              {expanded === sub.id && (
                <div className="border-t border-white/8 px-5 pb-5 pt-4 space-y-4">
                  <p className="text-sm leading-relaxed text-white/70">{sub.message}</p>
                  <div className="flex flex-wrap gap-4">
                    <a href={`tel:${sub.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Phone className="size-3.5" />{sub.phone}
                    </a>
                    <a href={`mailto:${sub.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Mail className="size-3.5" />{sub.email}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    {(["new", "read", "replied"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(sub.id, s)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                          sub.status === s
                            ? statusCls(s)
                            : "border-white/10 text-white/40 hover:border-white/20"
                        }`}
                      >
                        Mark as {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Submission"
        message="This will permanently delete this contact submission."
        onConfirm={() => deleteTarget && remove(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
