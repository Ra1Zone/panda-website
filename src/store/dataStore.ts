// Data access layer — all reads and writes go through here.
// To connect a real backend: replace storage.get/set calls with API calls in each function.

import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { normalizeHomeContent } from "./normalize";
import {
  defaultHomeContent,
  defaultServices,
  defaultPortfolio,
  defaultTestimonials,
  defaultBrands,
  defaultAboutContent,
  defaultSettings,
} from "./defaults";
import type {
  HomeContent,
  ServiceItem,
  PortfolioItem,
  Testimonial,
  Brand,
  ContactSubmission,
  AboutContent,
  SiteSettings,
} from "./types";

// ─── Home ──────────────────────────────────────────────────────────────────

export const homeStore = {
  // Always normalize on read: guards against old/incomplete localStorage data
  get: (): HomeContent => normalizeHomeContent(storage.get("home", defaultHomeContent) as unknown),
  set: (data: HomeContent): void => storage.set("home", data),
};

// ─── Services ──────────────────────────────────────────────────────────────

export const servicesStore = {
  getAll: (): ServiceItem[] => storage.get("services", defaultServices),
  save: (items: ServiceItem[]): void => storage.set("services", items),
  getActive: (): ServiceItem[] =>
    servicesStore.getAll().filter((s) => s.active).sort((a, b) => a.order - b.order),
};

// ─── Portfolio ─────────────────────────────────────────────────────────────

export const portfolioStore = {
  getAll: (): PortfolioItem[] => {
    const raw = storage.get("portfolio", defaultPortfolio) as PortfolioItem[];
    return raw.map((item) => {
      const mediaType = item.mediaType ?? item.type ?? "image";
      const coverImage = item.coverImage ?? item.image ?? "";
      const coverVideo = item.coverVideo ?? item.video;
      return {
        ...item,
        mediaType,
        coverImage,
        coverVideo,
        // Keep legacy fields in sync so any code that hasn't migrated still works
        image: coverImage,
        type: mediaType,
        video: coverVideo,
        gallery: item.gallery ?? [],
      };
    });
  },
  save: (items: PortfolioItem[]): void => storage.set("portfolio", items),
  getActive: (): PortfolioItem[] =>
    portfolioStore.getAll().filter((p) => p.active).sort((a, b) => a.order - b.order),
  getFeatured: (): PortfolioItem | undefined =>
    portfolioStore.getActive().find((p) => p.featured) ?? portfolioStore.getActive()[0],
};

// ─── Testimonials ──────────────────────────────────────────────────────────

export const testimonialsStore = {
  getAll: (): Testimonial[] => storage.get("testimonials", defaultTestimonials),
  save: (items: Testimonial[]): void => storage.set("testimonials", items),
  getActive: (): Testimonial[] =>
    testimonialsStore.getAll().filter((t) => t.active).sort((a, b) => a.order - b.order),
};

// ─── Brands ────────────────────────────────────────────────────────────────

export const brandsStore = {
  getAll: (): Brand[] => storage.get("brands", defaultBrands),
  save: (items: Brand[]): void => storage.set("brands", items),
  getActive: (): Brand[] =>
    brandsStore.getAll().filter((b) => b.active).sort((a, b) => a.order - b.order),
};

// ─── Contact Submissions ───────────────────────────────────────────────────

export const contactStore = {
  getAll: (): ContactSubmission[] => storage.get("contact_submissions", [] as ContactSubmission[]),
  save: (items: ContactSubmission[]): void => storage.set("contact_submissions", items),
  add: (submission: Omit<ContactSubmission, "id" | "date" | "status">): void => {
    const all = contactStore.getAll();
    const newEntry: ContactSubmission = {
      ...submission,
      id: `sub_${Date.now()}`,
      date: new Date().toISOString(),
      status: "new",
    };
    contactStore.save([newEntry, ...all]);
  },
  updateStatus: (id: string, status: ContactSubmission["status"]): void => {
    const all = contactStore.getAll().map((s) => (s.id === id ? { ...s, status } : s));
    contactStore.save(all);
  },
  delete: (id: string): void => {
    contactStore.save(contactStore.getAll().filter((s) => s.id !== id));
  },
};

// ─── About ─────────────────────────────────────────────────────────────────

export const aboutStore = {
  get: (): AboutContent => storage.get("about", defaultAboutContent),
  set: (data: AboutContent): void => storage.set("about", data),
};

// ─── Settings ──────────────────────────────────────────────────────────────

export const settingsStore = {
  get: (): SiteSettings => storage.get("settings", defaultSettings),
  set: (data: SiteSettings): void => storage.set("settings", data),
};

// ─── Auth ──────────────────────────────────────────────────────────────────

const RATE_LIMIT_KEY = "panda_auth_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord { count: number; lockedUntil: number; lastAttempt: number; }

function readAttempts(): AttemptRecord {
  try {
    return JSON.parse(sessionStorage.getItem(RATE_LIMIT_KEY) ?? "null") ?? { count: 0, lockedUntil: 0, lastAttempt: 0 };
  } catch { return { count: 0, lockedUntil: 0, lastAttempt: 0 }; }
}

function recordFailed(): AttemptRecord {
  const now = Date.now();
  const rec = readAttempts();
  const count = (now - rec.lastAttempt > LOCKOUT_DURATION) ? 1 : rec.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION : 0;
  const updated = { count, lockedUntil, lastAttempt: now };
  sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(updated));
  return updated;
}

function clearAttempts(): void {
  sessionStorage.removeItem(RATE_LIMIT_KEY);
}

function randomToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type LoginResult = { ok: boolean; locked: boolean; lockedUntil: number };

export const authStore = {
  SESSION_KEY: "panda_admin_session",

  login: (credential: string, password: string): LoginResult => {
    const rec = readAttempts();
    if (rec.lockedUntil > Date.now()) {
      return { ok: false, locked: true, lockedUntil: rec.lockedUntil };
    }

    const settings = settingsStore.get();
    const emailMatch = credential.trim().toLowerCase() === settings.adminUsername.trim().toLowerCase();
    if (!emailMatch) {
      const updated = recordFailed();
      return { ok: false, locked: updated.lockedUntil > Date.now(), lockedUntil: updated.lockedUntil };
    }

    const storedHash = settings.adminPasswordHash;
    let passwordOk = false;

    if (storedHash.startsWith("$2b$") || storedHash.startsWith("$2a$")) {
      try { passwordOk = bcrypt.compareSync(password, storedHash); } catch { /* ignore */ }
    } else {
      // Legacy base64 fallback — transparently migrate to bcrypt on success
      passwordOk = btoa(password) === storedHash;
      if (passwordOk) {
        try {
          const newHash = bcrypt.hashSync(password, 10);
          settingsStore.set({ ...settings, adminPasswordHash: newHash });
        } catch { /* ignore migration failure */ }
      }
    }

    if (passwordOk) {
      clearAttempts();
      const token = randomToken();
      const session = { token, username: settings.adminUsername, expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
      sessionStorage.setItem(authStore.SESSION_KEY, JSON.stringify(session));
      return { ok: true, locked: false, lockedUntil: 0 };
    }

    const updated = recordFailed();
    return { ok: false, locked: updated.lockedUntil > Date.now(), lockedUntil: updated.lockedUntil };
  },

  logout: (): void => {
    sessionStorage.removeItem(authStore.SESSION_KEY);
  },

  isAuthenticated: (): boolean => {
    try {
      const raw = sessionStorage.getItem(authStore.SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      return !!session.token && session.expiresAt > Date.now();
    } catch { return false; }
  },

  getUsername: (): string => {
    try {
      const raw = sessionStorage.getItem(authStore.SESSION_KEY);
      if (!raw) return "";
      return JSON.parse(raw).username ?? "";
    } catch { return ""; }
  },

  getLockout: (): { locked: boolean; lockedUntil: number } => {
    const rec = readAttempts();
    return { locked: rec.lockedUntil > Date.now(), lockedUntil: rec.lockedUntil };
  },

  needsSetup: (): boolean => {
    return !settingsStore.get().adminPasswordHash;
  },

  setupCredentials: (email: string, password: string): boolean => {
    try {
      const hash = bcrypt.hashSync(password, 10);
      settingsStore.set({ ...settingsStore.get(), adminUsername: email.trim(), adminPasswordHash: hash });
      return true;
    } catch { return false; }
  },
};
