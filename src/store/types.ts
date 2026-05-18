export type Lang = "en" | "ar" | "he";

export interface BilingualText {
  en: string;
  ar: string;
  he?: string;
}

export interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: BilingualText;
}

export interface HeroCampaignItem {
  id: string;
  title: BilingualText;
  number: string;
}

export interface HeroStrategyTab {
  id: string;
  title: BilingualText;
  number: string;
}

export interface HomeContent {
  heroBadge: BilingualText;
  heroTitleBefore: BilingualText;
  heroTitleHighlight: BilingualText;
  heroTitleAfter: BilingualText;
  heroSubtitle: BilingualText;
  heroPrimaryCtaLabel: BilingualText;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: BilingualText;
  heroSecondaryCtaHref: string;
  heroStrategyTabs: HeroStrategyTab[];
  heroMainImage: string;
  heroSecondaryImage: string;
  heroBottomImage: string;
  heroCampaignRoomLabel: BilingualText;
  heroCampaignItems: HeroCampaignItem[];
  heroBottomBarText: BilingualText;
  heroSignalLabel: BilingualText;
  heroSignalTitle: BilingualText;
  statsEyebrow: BilingualText;
  statsHeadline: BilingualText;
  stats: StatItem[];
  servicesHeadline?: BilingualText;
  finalCtaTitle: BilingualText;
  finalCtaSub: BilingualText;
}

export interface ServiceItem {
  id: string;
  slug: string;
  number: string;
  icon: string;
  image: string;
  title: BilingualText;
  desc: BilingualText;
  note: BilingualText;
  tags: { en: string[]; ar: string[] };
  bullets: { en: string[]; ar: string[] };
  bestFor: { en: string[]; ar: string[] };
  featured?: boolean;
  active: boolean;
  order: number;
}

export type PortfolioCategory = "branding" | "social" | "content" | "ads" | "offline";

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  alt?: BilingualText;
  caption?: BilingualText;
  order: number;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: BilingualText;
  category: PortfolioCategory;

  // Primary media fields — always set by normalization
  mediaType: "image" | "video";
  coverImage: string;
  coverVideo?: string;
  videoPoster?: string;

  // Legacy fields kept in storage for backward compatibility; normalized on read
  image: string;
  video?: string;
  type: "image" | "video";

  impact: BilingualText;
  challenge?: BilingualText;
  strategy?: BilingualText;
  result?: BilingualText;
  execution?: BilingualText;
  gallery?: GalleryItem[];
  featured: boolean;
  active: boolean;
  order: number;
}

export interface Testimonial {
  id: string;
  quote: BilingualText;
  author: BilingualText;
  role: BilingualText;
  active: boolean;
  order: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  category: BilingualText;
  story: BilingualText;
  active: boolean;
  order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  date: string;
  status: "new" | "read" | "replied";
}

export interface AboutContent {
  heroTitle: BilingualText;
  heroSubtitle: BilingualText;
  storyText: BilingualText;
  mission: BilingualText;
  vision: BilingualText;
  values: BilingualText[];
  teamImage: string;
}

export interface SiteSettings {
  companyName: string;
  phone: string;
  email: string;
  location: BilingualText;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  seoTitle: string;
  seoDescription: string;
  logoText: string;
  adminUsername: string;
  adminPasswordHash: string;
}
