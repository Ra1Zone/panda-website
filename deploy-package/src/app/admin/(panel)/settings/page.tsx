"use client";

import { useState, useEffect } from "react";
import { BilingualField } from "@/admin/components/BilingualField";
import type { SiteSettings } from "@/store/types";
import { Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const inputCls =
  "w-full h-10 rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50";

const defaultSettings: SiteSettings = {
  companyName: "",
  phone: "",
  email: "",
  location: { en: "", ar: "" },
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  seoTitle: "",
  seoDescription: "",
  logoText: "",
  adminUsername: "",
  adminPasswordHash: "",
};

export default function SettingsPageComponent() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({ ...defaultSettings, ...data });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const toSave = { ...settings };
      if (newPassword.trim()) {
        toSave.adminPasswordHash = newPassword.trim();
      }
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      setSettings(toSave);
      setNewPassword("");
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const f = (field: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((p) => ({ ...p, [field]: e.target.value }));

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
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-white/45">Site configuration and admin credentials</p>
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

      {/* Company */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Company Info</h2>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Company Name</label>
          <input type="text" value={settings.companyName} onChange={f("companyName")} className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Phone</label>
            <input type="tel" value={settings.phone} onChange={f("phone")} className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Email</label>
            <input type="email" value={settings.email} onChange={f("email")} className={inputCls} dir="ltr" />
          </div>
        </div>
        <BilingualField
          label="Location"
          value={settings.location}
          onChange={(v) => setSettings((p) => ({ ...p, location: v }))}
        />
      </section>

      {/* SEO */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">SEO</h2>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">SEO Title</label>
          <input type="text" value={settings.seoTitle} onChange={f("seoTitle")} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">SEO Description</label>
          <textarea
            value={settings.seoDescription}
            onChange={(e) => setSettings((p) => ({ ...p, seoDescription: e.target.value }))}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#111111] px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-primary/50"
          />
        </div>
      </section>

      {/* Social */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Social Links</h2>
        {(["instagramUrl", "facebookUrl", "twitterUrl", "linkedinUrl"] as const).map((field) => (
          <div key={field}>
            <label className="mb-1.5 block text-xs capitalize text-white/50">{field.replace("Url", "")}</label>
            <input type="url" value={settings[field]} onChange={f(field)} placeholder="https://..." className={inputCls} dir="ltr" />
          </div>
        ))}
      </section>

      {/* Admin credentials */}
      <section className="rounded-2xl border border-white/8 bg-[#111111] p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Admin Credentials</h2>
        <p className="text-xs text-white/35">
          Change the admin username and password. Leave &quot;New Password&quot; blank to keep the current password.
        </p>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Username</label>
          <input
            type="text"
            value={settings.adminUsername}
            onChange={f("adminUsername")}
            className={inputCls}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">New Password (leave blank to keep current)</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className={`${inputCls} pr-12`}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400/80">
          Credentials are managed server-side via the API. Password changes are processed securely on the backend.
        </div>
      </section>
    </div>
  );
}
