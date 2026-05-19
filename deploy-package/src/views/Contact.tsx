"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { getLocalized } from "@/lib/localize";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState, useEffect, useRef, FormEvent } from "react";
import { toast } from "sonner";
import type { SiteSettings } from "@/store/types";

const defaultSettings: SiteSettings = {
  companyName: "Panda Marketing",
  phone: "+972 597 228 693",
  email: "panda.marketing111@gmail.com",
  location: { en: "Hebron, Palestine", ar: "الخليل، فلسطين" },
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

interface ContactPageProps {
  settings: SiteSettings | null;
}

const ContactPage = ({ settings: propSettings }: ContactPageProps) => {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const settings = propSettings ?? defaultSettings;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    if (!form.name || !form.email || !form.message) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setForm({ name: "", phone: "", email: "", message: "" });
      setStatus("success");
      toast.success(t("form.sent"));
      resetTimer.current = setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("idle");
      toast.error("Failed to send message");
    }
  };

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const inputCls =
    "w-full h-14 rounded-[1rem] border border-white/10 bg-[#111111] px-5 outline-none transition-all duration-300 placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-[#151515] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]";

  return (
    <div className="home-surface home-surface--contact">
      <section className="container-x page-hero">
        <p className="eyebrow mb-8">{t("nav.contact")}</p>
        <h1 className="display max-w-4xl" data-cinematic>{t("page.contact.title")}</h1>
        <p className="mt-8 lede" data-cinematic>{t("page.contact.sub")}</p>
      </section>

      <section className="container-x section-b grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <form onSubmit={submit} className="premium-card space-y-4 p-6 md:p-8" data-cinematic>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                required
                name="name"
                value={form.name}
                onChange={update("name")}
                placeholder={t("form.name")}
                className={inputCls}
              />
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder={t("form.phone")}
                className={inputCls}
              />
            </div>
            <input
              required
              name="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder={t("form.email")}
              className={inputCls}
            />
            <textarea
              required
              name="message"
              value={form.message}
              onChange={update("message")}
              placeholder={t("form.message")}
              rows={6}
              className="w-full resize-none rounded-[1rem] border border-white/10 bg-[#111111] px-5 py-4 outline-none transition-all duration-300 placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-[#151515] focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
            />
            <Button type="submit" size="lg" disabled={status !== "idle"}>
              {status === "success" ? t("form.sent") : t("form.send")}
            </Button>
          </form>
        </div>

        <aside className="h-fit rounded-[1.25rem] border border-white/10 bg-[#151515] p-8 text-foreground shadow-[0_20px_70px_hsl(0_0%_0%/0.34)] md:p-10 lg:col-span-5" data-cinematic>
          <p className="eyebrow mb-8">{settings.companyName}</p>
          <ul className="space-y-8">
            <li className="flex gap-4">
              <Phone className="size-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("contact.phone")}</p>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-lg mt-1 block hover:text-primary" dir="ltr">
                  {settings.phone}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="size-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("contact.email")}</p>
                <a href={`mailto:${settings.email}`} className="text-lg mt-1 block hover:text-primary break-all" dir="ltr">
                  {settings.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <MapPin className="size-5 text-primary mt-1 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t("contact.location")}</p>
                <p className="text-lg mt-1">{getLocalized(settings.location, lang)}</p>
              </div>
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
};

export default ContactPage;
