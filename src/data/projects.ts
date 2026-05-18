import w1 from "@/assets/work-1.jpg";
import w2 from "@/assets/work-2.jpg";
import w3 from "@/assets/work-3.jpg";
import w4 from "@/assets/work-4.jpg";
import w5 from "@/assets/work-5.jpg";
import w6 from "@/assets/work-6.jpg";

export type Project = {
  slug: string;
  title: { en: string; ar: string };
  category: "branding" | "social" | "content" | "ads";
  img: string;
  overview: { en: string; ar: string };
};

export const projects: Project[] = [
  { slug: "atlas-rebrand", title: { en: "Atlas Rebrand", ar: "إعادة هوية أطلس" }, category: "branding", img: w1,
    overview: { en: "Full rebrand for a regional skincare leader.", ar: "إعادة هوية شاملة لرائد العناية بالبشرة." } },
  { slug: "north-social", title: { en: "North Social System", ar: "نظام نورث الاجتماعي" }, category: "social", img: w2,
    overview: { en: "Always-on social engine for a fintech challenger.", ar: "محرك اجتماعي دائم لشركة تقنية مالية." } },
  { slug: "fazion-editorial", title: { en: "Fazion Editorial", ar: "حملة فازيون التحريرية" }, category: "content", img: w3,
    overview: { en: "Editorial campaign positioning a fashion house globally.", ar: "حملة تحريرية لتموضع دار أزياء عالمياً." } },
  { slug: "noir-launch", title: { en: "Noir Product Launch", ar: "إطلاق نوار" }, category: "content", img: w4,
    overview: { en: "Launch creative for a premium beverage line.", ar: "إبداع إطلاق لخط مشروبات فاخر." } },
  { slug: "metro-ooh", title: { en: "Metro OOH", ar: "حملة مترو الخارجية" }, category: "ads", img: w5,
    overview: { en: "Out-of-home campaign across three capitals.", ar: "حملة خارجية في ثلاث عواصم." } },
  { slug: "verde-identity", title: { en: "Verde Identity", ar: "هوية فيردي" }, category: "branding", img: w6,
    overview: { en: "Identity & stationery for a wellness studio.", ar: "هوية وقرطاسية لاستوديو عافية." } },
];

export const categories = ["all", "branding", "ads", "content", "social"] as const;
