import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { useState } from "react";
import { ArrowRight, Check, Layers, LineChart, Megaphone, MonitorSmartphone, Sparkles, Compass } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { getLocalized, getLocalizedArray } from "@/lib/localize";
import { servicesStore } from "@/store/dataStore";
import { defaultServices } from "@/store/defaults";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  MonitorSmartphone, Sparkles, Layers, LineChart, Megaphone, Compass,
};

const processSteps = [
  { en: "Discover", ar: "اكتشاف", he: "גילוי" },
  { en: "Strategy", ar: "استراتيجية", he: "אסטרטגיה" },
  { en: "Production", ar: "إنتاج", he: "הפקה" },
  { en: "Launch", ar: "إطلاق", he: "השקה" },
  { en: "Optimize", ar: "تحسين", he: "אופטימיזציה" },
];

const heroMiniCards = [
  { en: "Strategy", ar: "استراتيجية", he: "אסטרטגיה" },
  { en: "Creative", ar: "إبداع", he: "יצירתיות" },
  { en: "Media", ar: "إعلام", he: "מדיה" },
  { en: "Production", ar: "إنتاج", he: "הפקה" },
];

const Services = () => {
  const { t, lang } = useI18n();
  const activeServices = servicesStore.getActive();
  const services = activeServices.length > 0 ? activeServices : defaultServices;

  return (
    <Layout>
      <div className="home-surface home-surface--services">
        <section className="container-x page-hero">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-6">{t("page.services.title")}</p>
              <h1 className="display max-w-5xl" data-cinematic>
                {t("page.services.heading")}
              </h1>
              <p className="mt-8 lede" data-cinematic style={{ "--delay": "100ms" } as CSSProperties}>
                {t("page.services.lede")}
              </p>
            </div>
            <div className="lg:col-span-4">
              <div className="premium-card overflow-hidden bg-[#151515] p-6 text-foreground" data-cinematic style={{ "--delay": "180ms" } as CSSProperties}>
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1rem] bg-white/10">
                  {heroMiniCards.map((m) => (
                    <div key={m.en} className="bg-[#151515] p-5">
                      <span className="block h-1.5 w-8 rounded-full bg-primary" />
                      <p className="mt-5 text-sm font-semibold">{getLocalized(m, lang)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky filter bar */}
        <section className="sticky top-16 z-30 border-y border-white/10 bg-[#0B0B0B]/88 py-3 backdrop-blur-xl md:top-[4.5rem]">
          <div className="container-x flex gap-2 overflow-x-auto">
            {services.map((service) => (
              <a
                key={service.id}
                href={`#service-${service.slug}`}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:border-primary/45 hover:bg-primary hover:text-primary-foreground"
              >
                {getLocalized(service.title, lang)}
              </a>
            ))}
          </div>
        </section>

        {/* Services list */}
        <section className="container-x py-16 md:py-24">
          <div className="space-y-10">
            {services.map((service, index) => {
              const Icon = ICON_MAP[service.icon] ?? Sparkles;
              const imageFirst = index % 2 === 1;
              return (
                <article
                  id={`service-${service.slug}`}
                  key={service.id}
                  className="cinematic-card scroll-mt-36 rounded-[1.5rem]"
                  data-cinematic
                  style={{ "--delay": `${(index % 3) * 70}ms` } as CSSProperties}
                >
                  <div className="grid gap-0 lg:grid-cols-12">
                    <div className={cn("p-8 md:p-10 lg:col-span-7 lg:p-12", imageFirst && "lg:order-2")}>
                      <div className="flex items-start justify-between gap-6">
                        <span className="text-6xl font-bold tracking-tight text-white/10 md:text-7xl">{service.number}</span>
                        <Icon className="size-10 text-primary" strokeWidth={1.35} />
                      </div>
                      <h2 className="mt-8 text-3xl font-bold tracking-tight md:text-5xl">{getLocalized(service.title, lang)}</h2>
                      <p className="mt-5 max-w-2xl text-lg leading-[1.75] text-muted-foreground">{getLocalized(service.desc, lang)}</p>

                      <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
                        <div>
                          <p className="eyebrow mb-4">{t("services.eyebrow")}</p>
                          <ul className="grid gap-3">
                            {getLocalizedArray(service.bullets, lang).filter(Boolean).map((item) => (
                              <li key={item} className="flex items-start gap-3 text-sm font-medium">
                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="eyebrow mb-4">{t("services.bestfor")}</p>
                          <div className="flex flex-wrap gap-2">
                            {getLocalizedArray(service.bestFor, lang).filter(Boolean).map((tag) => (
                              <span key={tag} className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Button asChild variant="ink" className="mt-10">
                        <Link to="/contact">
                          {t("services.discuss")} <ArrowRight className="rtl:rotate-180" />
                        </Link>
                      </Button>
                    </div>

                    <div className={cn("relative min-h-[360px] overflow-hidden bg-[#0B0B0B] lg:col-span-5", imageFirst && "lg:order-1")}>
                      {service.image && (
                        <img
                          src={service.image}
                          alt={getLocalized(service.title, lang)}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover opacity-90"
                          onError={(e) => (e.currentTarget.style.opacity = "0")}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/84 via-[#0B0B0B]/22 to-transparent" />
                      <div className="absolute inset-x-6 bottom-6 rounded-[1.1rem] border border-white/10 bg-[#151515]/72 p-5 text-foreground backdrop-blur">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            {getLocalized({ en: "Panda Service", ar: "خدمة باندا", he: "שירות פנדה" }, lang)}
                          </span>
                          <span className="size-2.5 rounded-full bg-primary" />
                        </div>
                        <p className="mt-5 text-2xl font-bold tracking-tight">{getLocalized(service.title, lang)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Process */}
        <section className="section-y section-dark-band">
          <div className="container-x">
            <p className="eyebrow mb-6">{t("services.process.eyebrow")}</p>
            <h2 className="h-section max-w-3xl">
              {t("services.process.heading")}
            </h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {processSteps.map((step, i) => (
                <div key={step.en} className="home-panel rounded-[1rem] p-6" data-cinematic style={{ "--delay": `${i * 60}ms` } as CSSProperties}>
                  <span className="text-sm font-bold text-primary">0{i + 1}</span>
                  <h3 className="mt-6 text-xl font-bold tracking-tight">{getLocalized(step, lang)}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-y bg-[#070707] text-foreground">
          <div className="container-x text-center">
            <h2 className="h-section mx-auto max-w-3xl">
              {t("services.cta.heading")}
            </h2>
            <div className="mt-10">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/contact">
                  {t("services.cta.button")} <ArrowRight className="rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Services;
