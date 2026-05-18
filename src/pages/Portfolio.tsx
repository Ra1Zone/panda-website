import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { getLocalized } from "@/lib/localize";
import { portfolioStore } from "@/store/dataStore";
import { defaultPortfolio } from "@/store/defaults";
import type { PortfolioItem, PortfolioCategory } from "@/store/types";
import { useVideoUrl } from "@/store/useVideoUrl";

const filterKeys: Array<"all" | PortfolioCategory> = ["all", "branding", "social", "content", "ads", "offline"];

const featuresStrip = [
  { en: "Built for clarity", ar: "مبني للوضوح", he: "בנוי לבהירות" },
  { en: "Designed for conversion", ar: "مصمم للتحويل", he: "מעוצב להמרה" },
  { en: "Executed across channels", ar: "منفذ عبر القنوات", he: "מבוצע בכל הערוצים" },
  { en: "Measured through reports", ar: "مقاس بالتقارير", he: "נמדד דרך דוחות" },
];

const PortfolioMedia = ({
  project,
  className,
  label,
  ctaLabel,
}: {
  project: PortfolioItem;
  className?: string;
  label: string;
  ctaLabel?: string;
}) => {
  const { lang } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const coverImage = project.coverImage || project.image;
  const coverVideoRef = project.coverVideo || project.video;
  const mediaType = project.mediaType ?? project.type ?? "image";
  const resolvedVideo = useVideoUrl(coverVideoRef);
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
    <div className={cn("portfolio-media relative overflow-hidden", className)}>
      <img
        src={coverImage}
        alt={getLocalized(project.title, lang)}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.06]"
        onError={(e) => (e.currentTarget.style.opacity = "0.3")}
      />
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          muted
          loop
          playsInline
          preload="metadata"
          poster={project.videoPoster || coverImage}
          onError={() => setVideoFailed(true)}
        >
          <source src={resolvedVideo} />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/84 via-[#0B0B0B]/10 to-transparent transition-opacity duration-300" />
      <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />
      {mediaType === "video" && (
        <span className="absolute top-5 rounded-full border border-primary/30 bg-[#101510]/82 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur ltr:left-5 rtl:right-5">
          {label}
        </span>
      )}
      {ctaLabel && (
        <div className="absolute inset-x-5 bottom-5 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <span className="inline-flex rounded-full border border-white/10 bg-[#151515]/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground backdrop-blur">
            {ctaLabel}
          </span>
        </div>
      )}
    </div>
  );
};

const Portfolio = () => {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<"all" | PortfolioCategory>("all");

  // Read from store with fallback to defaults
  const allActive = portfolioStore.getActive();
  const cases = allActive.length > 0 ? allActive : defaultPortfolio.filter((p) => p.active);

  const visibleCases = filter === "all" ? cases : cases.filter((item) => item.category === filter);
  const featured = portfolioStore.getFeatured() ?? cases[0];

  return (
    <Layout>
      <div className="home-surface home-surface--portfolio">
        <section className="container-x page-hero">
          <p className="eyebrow mb-6">{t("portfolio.eyebrow")}</p>
          <h1 className="display max-w-5xl" data-cinematic>
            {t("page.portfolio.heading")}
          </h1>
          <p className="mt-8 lede" data-cinematic style={{ "--delay": "100ms" } as CSSProperties}>
            {t("page.portfolio.lede")}
          </p>
          <div className="mt-10 flex flex-wrap gap-2">
            {filterKeys.slice(1).map((key) => (
              <span key={key} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t(`filter.${key}`)}
              </span>
            ))}
          </div>
        </section>

        {/* Featured case study */}
        {featured && (
          <section className="container-x">
            <article className="cinematic-card rounded-[1.5rem] bg-[#111111] text-foreground" data-cinematic>
              <div className="grid lg:grid-cols-12">
                <Link to={`/portfolio/${featured.slug}`} className="group relative min-h-[440px] overflow-hidden lg:col-span-7">
                  <PortfolioMedia project={featured} label={t("portfolio.video")} className="absolute inset-0" />
                  <span className="absolute bottom-6 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground ltr:left-6 rtl:right-6">
                    {t("portfolio.featured")}
                  </span>
                </Link>
                <div className="p-8 md:p-10 lg:col-span-5 lg:p-12">
                  <p className="eyebrow mb-8">{t(`filter.${featured.category}`)}</p>
                  <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{getLocalized(featured.title, lang)}</h2>
                  <div className="mt-8 space-y-6">
                    {[
                      [t("portfolio.challenge"), featured.challenge ? getLocalized(featured.challenge, lang) : undefined],
                      [t("portfolio.strategy.label"), featured.strategy ? getLocalized(featured.strategy, lang) : undefined],
                      [t("portfolio.result.label"), featured.result ? getLocalized(featured.result, lang) : undefined],
                    ].map(([label, body]) =>
                      body ? (
                        <div key={label as string}>
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{label}</p>
                          <p className="mt-2 text-sm leading-[1.75] text-muted-foreground">{body}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                  <Button asChild size="lg" className="mt-10 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to={`/portfolio/${featured.slug}`}>
                      {t("portfolio.viewcase")} <ArrowRight className="rtl:rotate-180" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Filter bar */}
        <section className="sticky top-16 z-30 mt-12 border-y border-white/10 bg-[#0B0B0B]/88 py-3 backdrop-blur-xl md:top-[4.5rem]">
          <div className="container-x flex gap-2 overflow-x-auto">
            {filterKeys.map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition-all duration-300",
                  filter === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/45 hover:text-foreground"
                )}
              >
                {t(`filter.${key}`)}
              </button>
            ))}
          </div>
        </section>

        {/* Portfolio grid */}
        <section className="container-x py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
            {visibleCases.map((project, i) => (
              <Link
                key={project.id}
                to={`/portfolio/${project.slug}`}
                className={cn(
                  "group block",
                  i % 5 === 0 || i % 5 === 3 ? "lg:col-span-7" : "lg:col-span-5",
                  i % 5 === 2 ? "lg:-mt-12" : ""
                )}
              >
                <article className="cinematic-card" data-cinematic style={{ "--delay": `${(i % 4) * 70}ms` } as CSSProperties}>
                  <PortfolioMedia
                    project={project}
                    label={t("portfolio.video")}
                    ctaLabel={t("portfolio.viewcase")}
                    className={cn(i % 5 === 0 || i % 5 === 3 ? "aspect-[16/10]" : "aspect-[4/5]")}
                  />
                  <div className="p-6 md:p-7">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <span className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{t(`filter.${project.category}`)}</span>
                      <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:text-primary rtl:-scale-x-100" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{getLocalized(project.title, lang)}</h2>
                    <p className="mt-4 text-sm leading-[1.75] text-muted-foreground">{getLocalized(project.impact, lang)}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Features strip */}
        <section className="section-dark-band py-12 md:py-14">
          <div className="container-x grid gap-4 md:grid-cols-4">
            {featuresStrip.map((item, i) => (
              <div key={item.en} className="home-panel rounded-[1rem] p-6" data-cinematic style={{ "--delay": `${i * 60}ms` } as CSSProperties}>
                <CheckCircle2 className="size-6 text-primary" />
                <p className="mt-6 text-lg font-bold tracking-tight">{getLocalized(item, lang)}</p>
                <span className="mt-4 block text-xs font-bold text-muted-foreground">0{i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="section-y bg-[#070707] text-foreground">
          <div className="container-x grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow mb-6">{t("portfolio.cta.eyebrow")}</p>
              <h2 className="h-section max-w-3xl">{t("portfolio.cta.heading")}</h2>
            </div>
            <div className="md:col-span-4 md:text-end">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/contact">
                  {t("cta.start")} <ArrowRight className="rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Portfolio;
