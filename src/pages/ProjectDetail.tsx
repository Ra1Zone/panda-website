import { useEffect, useRef } from "react";
import { Layout } from "@/components/site/Layout";
import { useI18n } from "@/i18n/I18nProvider";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalized } from "@/lib/localize";
import { portfolioStore } from "@/store/dataStore";
import type { GalleryItem } from "@/store/types";
import { useVideoUrl } from "@/store/useVideoUrl";

const GalleryVideo = ({ src, poster }: { src: string; poster?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolvedSrc = useVideoUrl(src);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedSrc) return;
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
  }, [resolvedSrc]);

  if (!resolvedSrc) return null;

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
    >
      <source src={resolvedSrc} />
    </video>
  );
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const { t, lang } = useI18n();

  const allItems = portfolioStore.getAll();
  const p = allItems.find((x) => x.slug === slug);

  if (!p) return <Navigate to="/portfolio" replace />;

  const coverImage = p.coverImage || p.image;
  const coverVideoRef = p.coverVideo || p.video;
  const mediaType = p.mediaType ?? p.type ?? "image";
  const gallery: GalleryItem[] = [...(p.gallery ?? [])].sort((a, b) => a.order - b.order);

  const blocks = [
    p.challenge?.en ? { key: "case.problem", body: p.challenge } : null,
    p.strategy?.en ? { key: "case.strategy", body: p.strategy } : null,
    p.execution?.en ? { key: "case.execution", body: p.execution } : null,
    p.result?.en ? { key: "case.results", body: p.result } : null,
  ].filter(Boolean) as Array<{ key: string; body: { en: string; ar: string } }>;

  const fallbackBlocks = [
    { key: "case.problem", body: { en: "A strategic challenge requiring a fresh perspective and integrated approach.", ar: "تحدٍّ استراتيجي يستوجب منظوراً جديداً ونهجاً متكاملاً." } },
    { key: "case.strategy", body: { en: "We developed a focused brand strategy and execution plan tailored to the client's goals.", ar: "طورنا استراتيجية علامة مركزة وخطة تنفيذ مصممة لأهداف العميل." } },
    { key: "case.results", body: { en: "Measurable improvement in brand recall, engagement, and business outcomes.", ar: "تحسن ملموس في تذكر العلامة والتفاعل والنتائج التجارية." } },
  ];

  const displayBlocks = blocks.length > 0 ? blocks : fallbackBlocks;

  return (
    <Layout>
      <section className="container-x pt-10 md:pt-14">
        <Button asChild variant="ghost" size="sm">
          <Link to="/portfolio"><ArrowLeft className="rtl:rotate-180" /> {t("nav.portfolio")}</Link>
        </Button>
        <div className="mt-8 max-w-3xl">
          <p className="eyebrow mb-4">{t(`filter.${p.category}`)}</p>
          <h1 className="display">{getLocalized(p.title, lang)}</h1>
          <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">{getLocalized(p.impact, lang)}</p>
        </div>
      </section>

      <MainMedia
        mediaType={mediaType}
        coverVideoRef={coverVideoRef}
        coverImage={coverImage}
        videoPoster={p.videoPoster}
        title={getLocalized(p.title, lang)}
      />

      <section className="container-x grid gap-10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{t("case.overview")}</p>
          <h2 className="h-section mt-4">{getLocalized(p.title, lang)}</h2>
        </div>
        <div className="lg:col-span-8 space-y-12">
          {displayBlocks.map((b) => (
            <div key={b.key} className="border-t border-border pt-8">
              <p className="eyebrow mb-3">{t(b.key)}</p>
              <p className="text-lg leading-relaxed">{getLocalized(b.body, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="container-x pb-16 md:pb-24">
          <p className="eyebrow mb-8">
            {getLocalized({ en: "Gallery", ar: "معرض الصور والفيديو", he: "גלריה" }, lang)}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-[1rem] bg-muted">
                <div className="aspect-[4/3] overflow-hidden">
                  {item.type === "video" && item.src ? (
                    <GalleryVideo src={item.src} poster={item.poster} />
                  ) : item.src ? (
                    <img
                      src={item.src}
                      alt={item.alt ? getLocalized(item.alt, lang) : getLocalized(p.title, lang)}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => (e.currentTarget.style.opacity = "0.3")}
                    />
                  ) : null}
                </div>
                {item.caption && getLocalized(item.caption, lang) && (
                  <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                    {getLocalized(item.caption, lang)}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

// Separate component so useVideoUrl is only called when mediaType === "video"
const MainMedia = ({
  mediaType,
  coverVideoRef,
  coverImage,
  videoPoster,
  title,
}: {
  mediaType: string;
  coverVideoRef: string | undefined;
  coverImage: string;
  videoPoster?: string;
  title: string;
}) => {
  const resolvedVideo = useVideoUrl(mediaType === "video" ? coverVideoRef : undefined);

  return (
    <section className="container-x mt-12">
      <div className="aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-muted shadow-[0_24px_80px_hsl(var(--foreground)/0.12)]">
        {mediaType === "video" && resolvedVideo ? (
          <video
            className="h-full w-full object-cover"
            controls
            preload="metadata"
            poster={videoPoster || coverImage || undefined}
          >
            <source src={resolvedVideo} />
          </video>
        ) : (
          <img
            src={coverImage}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.opacity = "0.3")}
          />
        )}
      </div>
    </section>
  );
};

export default ProjectDetail;
