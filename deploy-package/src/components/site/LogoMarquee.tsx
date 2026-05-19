import { useState } from "react";
import {
  Coffee,
  Utensils,
  Leaf,
  ShoppingBag,
  Sparkles,
  MapPin,
  Package,
  Activity,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import { getLocalized } from "@/lib/localize";

export type ClientLogo = {
  name: string;
  logo?: string;
  alt?: string;
  category: string | { en: string; ar: string; he?: string };
  story?: string | { en: string; ar: string; he?: string };
};

const localize = (value: ClientLogo["category"] | ClientLogo["story"], lang: string) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return getLocalized(value, lang as "en" | "ar" | "he");
};

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  restaurant: Utensils,
  cafe: Coffee,
  clinic: Leaf,
  fashion: Sparkles,
  retail: ShoppingBag,
  wellness: Activity,
  campaign: MapPin,
};

const iconForCategory = (
  category: string | { en: string; ar: string }
): React.ComponentType<any> => {
  const key = (typeof category === "string" ? category : category.en).toLowerCase().trim();
  return CATEGORY_ICONS[key] ?? Package;
};

const LogoTile = ({ client }: { client: ClientLogo }) => {
  const { lang } = useI18n();
  const [imgError, setImgError] = useState(false);
  const category = localize(client.category, lang);
  const story = localize(client.story, lang);
  const Icon = iconForCategory(client.category);
  const showIcon = !client.logo || imgError;

  return (
    <article className="logo-tile group">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="logo-mark-wrap flex items-center justify-center">
          {showIcon ? (
            <span className="logo-icon-badge">
              <Icon strokeWidth={1.5} />
            </span>
          ) : (
            <img
              src={client.logo}
              alt={client.alt ?? `${client.name} logo`}
              loading="lazy"
              className="logo-mark-img"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div>
          <h3 className="logo-brand-name">{client.name}</h3>
          <p className="logo-category">{category}</p>
        </div>
      </div>
      {story && <p className="logo-story">{story}</p>}
    </article>
  );
};

export const LogoMarquee = ({ clients, className }: { clients: ClientLogo[]; className?: string }) => {
  const { t, lang } = useI18n();
  const title = t("brands.title");
  const subtitle = t("brands.sub");
  const proof = t("brands.proof");
  const track = [...clients, ...clients];
  const marqueeClass = lang !== "en" ? "brand-marquee-rtl" : "brand-marquee-ltr";

  return (
    <section className={cn("trusted-strip overflow-hidden py-14 md:py-20", className)}>
      <div className="container-x relative z-10 mb-9 flex flex-col items-center justify-center text-center">
        <p className="hero-kicker rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </p>
        <p className="mt-5 max-w-3xl text-base leading-[1.85] text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      </div>

      {/* Horizontal marquee — shown on ALL screen sizes. dir="ltr" locks the track layout
          direction so the CSS transform animation is consistent regardless of page direction. */}
      <div className="brand-marquee-mask group/marquee" dir="ltr">
        <div className={cn("brand-marquee-track", marqueeClass)} aria-hidden="true">
          {track.map((client, i) => (
            <LogoTile key={`${client.name}-${i}`} client={client} />
          ))}
        </div>
      </div>

      <div className="container-x relative z-10 mt-7 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/75">{proof}</p>
      </div>
    </section>
  );
};
