"use client";

import Link from "next/link";
import { ArrowRight, Brush, Camera, Clapperboard, Compass, Megaphone, Palette, PenTool, Radio, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
import { getLocalized } from "@/lib/localize";
import { defaultAboutContent } from "@/store/defaults";
import type { AboutContent, ServiceItem, Brand } from "@/store/types";

const capabilities = [
  { icon: Compass, en: "Brand Strategy", ar: "استراتيجية العلامة", he: "אסטרטגיית מותג" },
  { icon: Palette, en: "Visual Identity", ar: "الهوية البصرية", he: "זהות ויזואלית" },
  { icon: Camera, en: "Content Production", ar: "إنتاج المحتوى", he: "הפקת תוכן" },
  { icon: PenTool, en: "Social Media Management", ar: "إدارة السوشيال", he: "ניהול מדיה חברתית" },
  { icon: TrendingUp, en: "Paid Media", ar: "الإعلانات المدفوعة", he: "מדיה ממומנת" },
  { icon: Radio, en: "Offline Campaigns", ar: "الحملات الميدانية", he: "קמפיינים אופליין" },
];

const culture = [
  {
    icon: Compass,
    title: { en: "Strategy room", ar: "غرفة الاستراتيجية", he: "חדר אסטרטגיה" },
    desc: { en: "Where goals, audience, and positioning become a clear route.", ar: "حيث تتحول الأهداف والجمهور والتموضع إلى مسار واضح.", he: "שם יעדים, קהל ופוזיציה הופכים למסלול ברור." },
  },
  {
    icon: Brush,
    title: { en: "Creative production", ar: "الإنتاج الإبداعي", he: "הפקה יצירתית" },
    desc: { en: "Content, visuals, and campaign assets built with disciplined craft.", ar: "محتوى ومرئيات ومواد حملات مبنية بإتقان منظم.", he: "תוכן, ויזואלים וחומרי קמפיין הבנויים במלאכת יד ממושמעת." },
  },
  {
    icon: Megaphone,
    title: { en: "Campaign execution", ar: "تنفيذ الحملات", he: "ביצוע קמפיינים" },
    desc: { en: "Coordinated launches across social, paid, creators, and offline channels.", ar: "إطلاقات منسقة عبر السوشيال، الإعلانات، المؤثرين، والميدان.", he: "השקות מתואמות בסושיאל, פרסום ממומן, יוצרים וערוצים אופליין." },
  },
  {
    icon: Clapperboard,
    title: { en: "Reporting & optimization", ar: "التقارير والتحسين", he: "דיווח ואופטימיזציה" },
    desc: { en: "Monthly clarity on what worked, what changed, and what comes next.", ar: "وضوح شهري لما نجح، ما تغير، وما الخطوة التالية.", he: "בהירות חודשית על מה עבד, מה השתנה, ומה הצעד הבא." },
  },
];

interface AboutPageProps {
  about: AboutContent | null;
  services: ServiceItem[];
  brands: Brand[];
}

const AboutPage = ({ about }: AboutPageProps) => {
  const { t, lang } = useI18n();
  const aboutData = about ?? defaultAboutContent;
  const values = aboutData.values.length > 0 ? aboutData.values : defaultAboutContent.values;

  return (
    <div className="home-surface home-surface--about">
      <section className="container-x page-hero">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6">{t("page.about.eyebrow")}</p>
            <h1 className="display max-w-5xl" data-cinematic>
              {getLocalized(aboutData.heroTitle, lang)}
            </h1>
            <p className="mt-8 lede" data-cinematic>
              {getLocalized(aboutData.heroSubtitle, lang)}
            </p>
          </div>
          <div className="lg:col-span-4">
            <div className="home-panel overflow-hidden rounded-[1.5rem] p-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] bg-[#0B0B0B]">
                <img src={aboutData.teamImage || "/assets/about/creative-studio-team.jpg"} alt="" className="h-full w-full object-cover opacity-90" onError={(e) => (e.currentTarget.src = "/assets/about/creative-studio-team.jpg")} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B]/72 via-transparent to-transparent" />
                <div className="absolute bottom-5 rounded-[1rem] border border-white/15 bg-[#151515]/68 p-4 text-foreground backdrop-blur ltr:left-5 ltr:right-5 rtl:left-5 rtl:right-5">
                  <Target className="size-7 text-primary" />
                  <p className="mt-4 text-3xl font-bold tracking-tight">120+</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("about.stats.label")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 border-t border-white/10 py-16 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow sticky top-28">{t("about.story.eyebrow")}</p>
        </div>
        <div className="lg:col-span-8">
          <p className="text-2xl font-medium leading-[1.32] tracking-tight md:text-4xl" data-cinematic>
            {getLocalized(aboutData.storyText, lang)}
          </p>
        </div>
      </section>

      <section className="container-x grid gap-8 py-10 md:grid-cols-2 md:py-16">
        {[
          { label: t("about.mission.label"), body: getLocalized(aboutData.mission, lang) },
          { label: t("about.vision.label"), body: getLocalized(aboutData.vision, lang) },
        ].map((item) => (
          <article key={item.label} className="home-panel rounded-[1.25rem] p-8 md:p-10">
            <p className="eyebrow mb-8">{item.label}</p>
            <p className="text-2xl font-bold leading-[1.25] tracking-tight md:text-3xl">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="section-y section-dark-band text-foreground">
        <div className="container-x">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow mb-6">{t("about.values.eyebrow")}</p>
            <h2 className="h-section">{t("about.values.heading")}</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[1.25rem] bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <article key={value.en} className="bg-[#151515] p-8 transition-colors duration-300 hover:bg-[#1A1A1A]">
                <span className="text-sm font-bold text-primary">0{i + 1}</span>
                <h3 className="mt-8 text-2xl font-bold tracking-tight">{getLocalized(value, lang)}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-6">{t("about.capabilities.eyebrow")}</p>
              <h2 className="h-section">{t("about.capabilities.heading")}</h2>
            </div>
            <p className="text-lg leading-[1.75] text-muted-foreground lg:col-span-5 lg:col-start-8">
              {t("about.capabilities.body")}
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, ...capability }) => (
              <article key={capability.en} className="home-panel rounded-[1.25rem] p-7 transition-transform duration-300 hover:-translate-y-1">
                <Icon className="size-8 text-primary" strokeWidth={1.35} />
                <h3 className="mt-10 text-xl font-bold tracking-tight">{getLocalized(capability, lang)}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y section-dark-band">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#151515] shadow-[0_22px_80px_hsl(0_0%_0%/0.34)] lg:col-span-5">
              <img src="/assets/about/strategy-room.jpg" alt="" loading="lazy" className="h-full min-h-[240px] md:min-h-[360px] lg:min-h-[420px] w-full object-cover opacity-92" />
            </div>
            <div className="lg:col-span-7">
              <p className="eyebrow mb-6">{t("about.culture.eyebrow")}</p>
              <h2 className="h-section max-w-3xl">{t("about.culture.heading")}</h2>
              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {culture.map(({ icon: Icon, title, desc }) => (
                  <article key={title.en} className="home-panel rounded-[1.1rem] p-6">
                    <Icon className="size-7 text-primary" strokeWidth={1.35} />
                    <h3 className="mt-6 text-xl font-bold tracking-tight">{getLocalized(title, lang)}</h3>
                    <p className="mt-3 text-sm leading-[1.75] text-muted-foreground">{getLocalized(desc, lang)}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-[#070707] text-foreground">
        <div className="container-x text-center">
          <h2 className="h-section mx-auto max-w-3xl">{t("about.cta.heading")}</h2>
          <div className="mt-10">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/contact">
                {t("cta.talk")} <ArrowRight className="rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
