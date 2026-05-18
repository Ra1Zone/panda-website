import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, Layers, LineChart, Megaphone, MonitorSmartphone, Sparkles } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { LogoMarquee } from "@/components/site/LogoMarquee";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { getLocalized, getLocalizedArray } from "@/lib/localize";
import {
  portfolioStore,
  testimonialsStore,
  brandsStore,
} from "@/store/dataStore";
import { useHomeContent, useServices } from "@/store/useStore";
import { defaultServices, defaultPortfolio, defaultTestimonials, defaultBrands } from "@/store/defaults";
import type { PortfolioItem } from "@/store/types";
import { useVideoUrl } from "@/store/useVideoUrl";

// Icon map for dynamic service icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  MonitorSmartphone,
  Sparkles,
  Layers,
  LineChart,
  Megaphone,
  Compass,
};

const homeAssets = {
  studio: "/assets/home/creative-strategy-session.jpg",
  brandWall: "/assets/home/brand-planning-wall.jpg",
  campaignLaptop: "/assets/home/campaign-laptop.jpg",
};

type StatItem = {
  id: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: { en: string; ar: string };
};

const AnimatedStat = ({ value, suffix = "", prefix = "", label, delay = 0 }: StatItem & { delay?: number }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const { lang } = useI18n();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) { setCount(value); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setCount(0); setActive(true); }
        else { setActive(false); setCount(0); }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const duration = 1500;
    const start = performance.now() + delay;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const progress = Math.min(Math.max((now - start) / duration, 0), 1);
      setCount(Math.round(value * easeOut(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, delay, value]);

  return (
    <div ref={ref} className="stat-card p-6 backdrop-blur sm:p-8 md:p-10">
      <dt className="text-4xl font-bold tracking-tight md:text-5xl">
        {prefix}{count}{suffix}
      </dt>
      <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{getLocalized(label, lang)}</dd>
    </div>
  );
};

const BrandManifesto = () => {
  const { t } = useI18n();
  return (
    <section className="manifesto-line py-6 md:py-8">
      <div className="container-x grid gap-5 md:grid-cols-3 md:items-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          {t("manifesto.label")}
        </p>
        <p className="text-xl font-semibold leading-snug tracking-tight md:col-span-2 md:text-2xl" data-cinematic>
          {t("manifesto.line.a")} <strong>{t("manifesto.line.b")}</strong> {t("manifesto.line.c")}
        </p>
      </div>
    </section>
  );
};

const Hero = () => {
  const { t, lang, dir } = useI18n();
  const home = useHomeContent();
  const tabs = home.heroStrategyTabs ?? [];
  const campaignItems = home.heroCampaignItems ?? [];

  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="identity-ghost" dir={dir} lang={lang}>
          {lang === "ar" ? "باندا" : lang === "he" ? "פנדה" : "PANDA"}
        </div>
        <div className="hero-gradient" />
        <div className="hero-texture" />
        <div className="hero-beams"><span /><span /><span /><span /><span /></div>
        <div className="hero-vignette" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      </div>

      <div className="container-x relative z-10 pb-16 pt-20 md:pb-20 md:pt-24 lg:pb-24 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="fade-up lg:col-span-6">
            <p className="hero-kicker mb-6 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground" data-cinematic>
              {getLocalized(home.heroBadge, lang, t("hero.eyebrow"))}
            </p>
            <h1 className="max-w-4xl text-[clamp(3rem,6vw,6rem)] font-bold leading-[1.1] md:leading-[0.97] tracking-[-0.03em]" data-cinematic style={{ "--delay": "90ms" } as CSSProperties}>
              {getLocalized(home.heroTitleBefore, lang)}{" "}
              <span className="brand-gradient-text">{getLocalized(home.heroTitleHighlight, lang)}</span>
              <br />
              {getLocalized(home.heroTitleAfter, lang)}
            </h1>
            <p className="mt-8 lede" data-cinematic style={{ "--delay": "160ms" } as CSSProperties}>
              {getLocalized(home.heroSubtitle, lang, t("hero.sub"))}
            </p>
            <div className="mt-10 flex flex-wrap gap-3" data-cinematic style={{ "--delay": "230ms" } as CSSProperties}>
              <Button asChild size="lg" variant="ink">
                <Link to={home.heroPrimaryCtaHref || "/contact"}>
                  {getLocalized(home.heroPrimaryCtaLabel, lang, t("cta.start"))} <ArrowRight className="rtl:rotate-180" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass" className="border-primary/20 hover:border-primary/40">
                <Link to={home.heroSecondaryCtaHref || "/portfolio"}>
                  {getLocalized(home.heroSecondaryCtaLabel, lang, t("cta.work"))} <ArrowUpRight className="rtl:-scale-x-100" />
                </Link>
              </Button>
            </div>
            {tabs.length > 0 && (
              <div className="hero-strategy-tabs mt-10 grid max-w-xl gap-px overflow-hidden rounded-[1rem] border border-white/10 bg-white/10 shadow-[0_20px_70px_hsl(0_0%_0%/0.28)]" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)`, "--delay": "300ms" } as CSSProperties} data-cinematic>
                {tabs.map((tab) => (
                  <div key={tab.id} className="bg-[#151515]/86 p-4 backdrop-blur transition-colors duration-300 hover:bg-primary/10">
                    <span className="text-xs font-bold text-primary">{tab.number}</span>
                    <p className="mt-3 text-sm font-semibold">{getLocalized(tab.title, lang)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fade-up lg:col-span-6" style={{ animationDelay: "0.2s" }}>
            <div className="hero-media-shell home-panel float-soft relative min-h-[540px] overflow-hidden rounded-[1.75rem] p-4 sm:p-5" data-cinematic style={{ "--delay": "180ms" } as CSSProperties}>
              <div className="absolute inset-0 grain opacity-18" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
              <div className="relative grid h-full min-h-[500px] grid-cols-12 grid-rows-12 gap-4">
                <div className="col-span-8 row-span-7 overflow-hidden rounded-[1.25rem] bg-[#0B0B0B] shadow-[0_20px_60px_hsl(0_0%_0%/0.38)]">
                  <img src={home.heroMainImage || homeAssets.studio} alt="" className="h-full w-full object-cover opacity-90" />
                </div>
                <div className="col-span-4 row-span-5 overflow-hidden rounded-[1.25rem] bg-[#1A1A1A] shadow-[0_18px_48px_hsl(0_0%_0%/0.34)]">
                  <img src={home.heroSecondaryImage || homeAssets.campaignLaptop} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="col-span-5 row-span-5 overflow-hidden rounded-[1.25rem] bg-[#1A1A1A] shadow-[0_18px_48px_hsl(0_0%_0%/0.34)]">
                  <img src={home.heroBottomImage || homeAssets.brandWall} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="col-span-7 row-span-5 rounded-[1.25rem] bg-[#0B0B0B] p-5 text-foreground shadow-[0_22px_70px_hsl(0_0%_0%/0.42)]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {getLocalized(home.heroCampaignRoomLabel, lang, "Campaign Room")}
                    </span>
                    <span className="size-2.5 rounded-full bg-primary" />
                  </div>
                  <div className="mt-8 space-y-3">
                    {campaignItems.map((item) => (
                      <div key={item.id} className="rounded-[0.9rem] border border-white/10 bg-white/[0.06] p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{item.number}</span>
                          <span className="text-sm font-semibold">{getLocalized(item.title, lang)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-5 rounded-full border border-white/10 bg-[#151515]/88 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground shadow-sm backdrop-blur ltr:left-5 rtl:right-5">
                  {getLocalized(home.heroBottomBarText, lang, t("hero.bottombar"))}
                </div>
                <div className="absolute rounded-[1rem] border border-primary/20 bg-[#101510]/85 px-4 py-3 shadow-[0_18px_50px_hsl(var(--primary)/0.12)] backdrop-blur ltr:right-5 ltr:top-5 rtl:left-5 rtl:top-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                    {getLocalized(home.heroSignalLabel, lang, "Panda Signal")}
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {getLocalized(home.heroSignalTitle, lang, t("hero.signal.title"))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="signature-panel green-thread mt-14 overflow-hidden rounded-[1.5rem] p-5 md:p-6" data-cinematic>
          <div className="relative grid gap-5 lg:grid-cols-[0.85fr_1.4fr] lg:items-end">
            <div className="p-3 md:p-5">
              <p className="eyebrow text-primary">
                {getLocalized(home.statsEyebrow, lang, t("hero.stats.eyebrow"))}
              </p>
              <h2 className="mt-5 text-3xl font-bold leading-[1.05] tracking-tight md:text-5xl">
                {getLocalized(home.statsHeadline, lang)}
              </h2>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/10 md:grid-cols-4">
              {(home.stats ?? []).map((item, idx) => (
                <AnimatedStat key={item.id} {...item} delay={idx * 90} />
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

const Clients = () => {
  const brands = brandsStore.getActive();
  const clients = brands.length > 0
    ? brands.map((b) => ({ name: b.name, logo: b.logo, category: b.category, story: b.story }))
    : defaultBrands.map((b) => ({ name: b.name, logo: b.logo, category: b.category, story: b.story }));
  return <LogoMarquee clients={clients} />;
};

const SERVICES_COUNT_EN = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const SERVICES_COUNT_AR = [
  "", "تخصص واحد", "تخصصان", "ثلاثة تخصصات", "أربع تخصصات",
  "خمس تخصصات", "ست تخصصات", "سبع تخصصات", "ثمانية تخصصات", "تسع تخصصات", "عشر تخصصات",
];
const SERVICES_COUNT_HE = [
  "", "תחום אחד", "שני תחומים", "שלושה תחומים", "ארבעה תחומים",
  "חמישה תחומים", "שישה תחומים", "שבעה תחומים", "שמונה תחומים", "תשעה תחומים", "עשרה תחומים",
];

const Services = () => {
  const { t, lang } = useI18n();
  const home = useHomeContent();
  const fromStore = useServices();
  const services = fromStore.length > 0 ? fromStore : defaultServices;

  const count = services.length;
  const customEn = home.servicesHeadline?.en;
  const customAr = home.servicesHeadline?.ar;
  const headingEn = customEn || (count <= 10 && count >= 1
    ? `${SERVICES_COUNT_EN[count]} discipline${count !== 1 ? "s" : ""}. One growth system.`
    : `${count} disciplines. One growth system.`);
  const headingAr = customAr || (count <= 10 && count >= 1
    ? `${SERVICES_COUNT_AR[count]}. نظام نمو واحد.`
    : `${count} تخصصات. نظام نمو واحد.`);
  const headingHe = customEn || (count <= 10 && count >= 1
    ? `${SERVICES_COUNT_HE[count]}. מערכת צמיחה אחת.`
    : `${count} תחומים. מערכת צמיחה אחת.`);

  const serviceImages = [
    homeAssets.campaignLaptop,
    "/assets/services/brand-identity-system.jpg",
    "/assets/services/content-production-studio.jpg",
    "/assets/services/paid-media-analytics.jpg",
    "/assets/services/offline-campaign-event.jpg",
  ];

  return (
    <section className="section-y">
      <div className="container-x">
        <div className="green-thread mb-12 grid gap-8 md:mb-14 lg:grid-cols-12" data-cinematic>
          <div className="lg:col-span-7">
            <p className="eyebrow mb-6">{t("services.eyebrow")}</p>
            <h2 className="h-section max-w-3xl">{lang === "ar" ? headingAr : lang === "he" ? headingHe : headingEn}</h2>
          </div>
          <div className="flex lg:col-span-5 lg:items-end lg:pt-2">
            <div className="max-w-md">
              <p className="text-lg leading-[1.75] text-muted-foreground">
                {t("services.connect")}
              </p>
              <Button asChild variant="outline" size="lg" className="mt-8">
                <Link to="/services">{t("services.cta.explore")} <ArrowRight className="rtl:rotate-180" /></Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {services.map((svc, idx) => {
            const Icon = ICON_MAP[svc.icon] ?? Sparkles;
            const img = svc.image || serviceImages[idx % serviceImages.length];
            return (
              <Link
                key={svc.id}
                to="/services"
                className={cn("group cinematic-card min-h-[330px] p-7 md:p-8", idx === 0 ? "sm:col-span-2 lg:col-span-6 lg:row-span-2" : "lg:col-span-3")}
                data-cinematic
                style={{ "--delay": `${idx * 70}ms` } as CSSProperties}
              >
                <img src={img} alt="" loading="lazy" className={cn("absolute inset-0 h-full w-full object-cover opacity-20 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-28", idx === 0 ? "opacity-32" : "")} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/88 to-[#151515]/54" />
                <div className="absolute inset-0 grain opacity-15" />
                <span className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-primary via-primary/50 to-transparent transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
                <div className="relative flex items-start justify-between">
                  <span className="eyebrow text-primary">{getLocalized({ en: "System", ar: "نظام", he: "מערכת" }, lang)} 0{idx + 1}</span>
                  <ArrowUpRight className="size-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl:-scale-x-100" />
                </div>
                <div className={cn("relative mt-12 flex items-center gap-3", idx === 0 && "mt-20")}>
                  <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/8 text-primary">
                    <Icon className="size-6" strokeWidth={1.35} />
                  </span>
                  <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">{getLocalized(svc.title, lang)}</span>
                </div>
                <div className="relative mt-10">
                  <h3 className={cn("font-bold tracking-tight", idx === 0 ? "text-4xl md:text-5xl" : "text-2xl")}>{getLocalized(svc.title, lang)}</h3>
                  <p className="mt-4 text-sm leading-[1.75] text-muted-foreground">{getLocalized(svc.note, lang)}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {getLocalizedArray(svc.tags, lang).map((tag) => (
                      <span key={tag} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const PortfolioCardMedia = ({ p, aspectClass }: { p: PortfolioItem; aspectClass: string }) => {
  const { t, lang } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const coverImage = p.coverImage || p.image;
  const coverVideoRef = p.coverVideo || p.video;
  const mediaType = p.mediaType ?? p.type ?? "image";
  const resolvedVideo = useVideoUrl(mediaType === "video" ? coverVideoRef : undefined);
  const showVideo = mediaType === "video" && resolvedVideo && !videoFailed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [showVideo]);

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectClass)}>
      <img
        src={coverImage}
        alt={getLocalized(p.title, lang)}
        loading="lazy"
        className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        onError={(e) => (e.currentTarget.style.opacity = "0")}
      />
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          muted
          loop
          playsInline
          preload="metadata"
          poster={p.videoPoster || coverImage}
          onError={() => setVideoFailed(true)}
        >
          <source src={resolvedVideo} />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/88 via-[#0B0B0B]/18 to-transparent" />
      <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />
      <div className="absolute top-5 rounded-full border border-primary/25 bg-primary/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur ltr:left-5 rtl:right-5">
        {t(`filter.${p.category}`)}
      </div>
      <div className="absolute inset-x-5 bottom-5 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="inline-flex rounded-full border border-white/10 bg-[#151515]/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground backdrop-blur">
          {t("portfolio.viewProject")}
        </span>
      </div>
    </div>
  );
};

const PortfolioPreview = () => {
  const { t, lang } = useI18n();
  const allProjects = portfolioStore.getActive();
  const projects = (allProjects.length > 0 ? allProjects : defaultPortfolio.filter((p) => p.active)).slice(0, 4);

  return (
    <section className="section-y section-dark-band relative overflow-hidden text-foreground">
      <div className="absolute inset-0 grain opacity-15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(64,143,78,0.14),transparent_30rem)]" />
      <div className="portfolio-word" dir={lang !== "en" ? "rtl" : "ltr"} lang={lang}>{lang === "ar" ? "أعمال" : lang === "he" ? "עבודה" : "WORK"}</div>
      <div className="container-x relative">
        <div className="green-thread mb-14 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between" data-cinematic>
          <div>
            <p className="eyebrow mb-6">{t("portfolio.eyebrow")}</p>
            <h2 className="h-section max-w-3xl">{t("portfolio.h2")}</h2>
          </div>
          <Button asChild variant="glass" size="lg" className="self-start text-foreground md:self-auto">
            <Link to="/portfolio">{t("portfolio.view")} <ArrowRight className="rtl:rotate-180" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
          {projects.map((p, i) => (
            <Link key={p.id} to={`/portfolio/${p.slug}`} className={cn("group block", i === 0 || i === 3 ? "lg:col-span-7" : "lg:col-span-5")} data-cinematic style={{ "--delay": `${i * 80}ms` } as CSSProperties}>
              <article className="cinematic-card">
                <PortfolioCardMedia p={p} aspectClass={i === 0 || i === 3 ? "aspect-[16/10]" : "aspect-[4/5]"} />
                <div className="flex items-end justify-between gap-6 p-6 md:p-7">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{t("portfolio.casestudy")}</p>
                    <h3 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">{getLocalized(p.title, lang)}</h3>
                    <p className="mt-3 text-sm leading-[1.7] text-muted-foreground">{getLocalized(p.impact, lang)}</p>
                  </div>
                  <ArrowUpRight className="mb-1 size-6 shrink-0 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl:-scale-x-100" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const { t, lang } = useI18n();
  const steps = [Compass, Layers, Sparkles, LineChart];
  return (
    <section className="section-y relative overflow-hidden">
      <div className="container-x relative">
        <div className="mb-14 max-w-3xl md:mb-16" data-cinematic>
          <p className="eyebrow mb-6">{t("process.eyebrow")}</p>
          <h2 className="h-section">{t("process.title")}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((Icon, i) => {
            const n = i + 1;
            return (
              <div key={n} className="cinematic-card rounded-[1.25rem] p-7" data-cinematic style={{ "--delay": `${i * 80}ms` } as CSSProperties}>
                <span className="text-xs tracking-widest text-muted-foreground">{getLocalized({ en: "Step", ar: "خطوة", he: "שלב" }, lang)} 0{n}</span>
                <Icon className="my-6 size-9 text-primary" strokeWidth={1.25} />
                <h3 className="text-xl font-semibold tracking-tight">{t(`process.${n}`)}</h3>
                <p className="mt-3 text-sm leading-[1.75] text-muted-foreground">{t(`process.${n}.d`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Why = () => {
  const { t } = useI18n();
  return (
    <section className="section-y section-dark-band">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-6">{t("why.eyebrow")}</p>
          <h2 className="h-section">{t("why.title")}</h2>
        </div>
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-7">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border-t border-white/10 pt-7" data-cinematic style={{ "--delay": `${n * 60}ms` } as CSSProperties}>
              <span className="text-xs font-semibold tracking-widest text-primary">0{n}</span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{t(`why.${n}.t`)}</h3>
              <p className="mt-3 leading-[1.75] text-muted-foreground">{t(`why.${n}.d`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const { t, lang, dir } = useI18n();
  const allTestimonials = testimonialsStore.getActive();
  const items = allTestimonials.length > 0 ? allTestimonials : defaultTestimonials.filter((t) => t.active);
  const [api, setApi] = useState<CarouselApi>();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIdx(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => { api.off("select", onSelect); api.off("reInit", onSelect); };
  }, [api]);

  useEffect(() => {
    if (!api || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => api.scrollNext(), 6200);
    return () => window.clearInterval(timer);
  }, [api, paused]);

  return (
    <section className="section-y relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(64,143,78,0.12),transparent_32rem)]" />
      <div className="container-x relative">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-14" data-cinematic>
          <p className="eyebrow mb-6 text-primary">{t("test.eyebrow")}</p>
          <h2 className="h-section">{t("test.h2")}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.8] text-muted-foreground md:text-lg">
            {t("test.sub")}
          </p>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "center", loop: true, direction: dir }}
          className="testimonial-carousel relative mx-auto max-w-5xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <CarouselContent>
            {items.map((item, slideIndex) => (
              <CarouselItem key={item.id}>
                <figure className="testimonial-card relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#151515]/82 p-6 shadow-[0_28px_100px_hsl(0_0%_0%/0.44)] backdrop-blur md:p-9 lg:p-10">
                  <div className="absolute inset-0 grain opacity-12" />
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                  <span className="testimonial-quote-mark start-mark" aria-hidden="true">{dir === "rtl" ? "”" : "“"}</span>
                  <span className="testimonial-quote-mark end-mark" aria-hidden="true">{dir === "rtl" ? "“" : "”"}</span>
                  <blockquote className="relative text-xl font-medium leading-[1.65] tracking-tight text-foreground md:text-2xl md:leading-[1.55]">
                    {getLocalized(item.quote, lang)}
                  </blockquote>
                  <figcaption className="relative mt-8 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/15 text-base font-bold text-primary shadow-[0_0_34px_hsl(var(--primary)/0.12)]">
                        {getLocalized(item.author, lang).trim().charAt(0)}
                      </span>
                      <span>
                        <span className="block font-semibold">{getLocalized(item.author, lang)}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">{getLocalized(item.role, lang)}</span>
                      </span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/75">
                      {String(slideIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-7 flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-2">
              {items.map((item, i) => (
                <button key={item.id} onClick={() => api?.scrollTo(i)} aria-label={`Go to testimonial ${i + 1}`}
                  className={cn("h-1.5 rounded-full transition-all duration-300", i === idx ? "w-14 bg-primary" : "w-7 bg-white/14 hover:bg-primary/45")} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => api?.scrollPrev()} className="icon-button size-11 border-white/10 bg-[#151515]/80 hover:border-primary/45" aria-label={getLocalized({ en: "Previous", ar: "السابق", he: "הקודם" }, lang)}>
                <ArrowLeft className="size-4 rtl:rotate-180" />
              </button>
              <button type="button" onClick={() => api?.scrollNext()} className="icon-button size-11 border-white/10 bg-[#151515]/80 hover:border-primary/45" aria-label={getLocalized({ en: "Next", ar: "التالي", he: "הבא" }, lang)}>
                <ArrowRight className="size-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  const { t, lang } = useI18n();
  const home = useHomeContent();

  return (
    <section className="section-y relative overflow-hidden bg-[#070707] text-foreground">
      <div className="absolute inset-0 grain opacity-15" />
      <div className="container-x relative text-center">
        <h2 className="display mx-auto max-w-4xl">
          {getLocalized(home.finalCtaTitle, lang, t("cta.final.title"))}
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {getLocalized(home.finalCtaSub, lang, t("cta.final.sub"))}
        </p>
        <div className="mt-12">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/contact">{t("cta.start")} <ArrowRight className="rtl:rotate-180" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Index = () => (
  <Layout>
    <div className="home-surface home-surface--home">
      <Hero />
      <BrandManifesto />
      <Clients />
      <Services />
      <PortfolioPreview />
      <Process />
      <Why />
      <Testimonials />
      <FinalCTA />
    </div>
  </Layout>
);

export default Index;
