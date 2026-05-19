"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeProvider";

const Logo = ({ className }: { className?: string }) => (
  <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label="Panda Marketing home">
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_34px_hsl(var(--primary)/0.24)] transition-transform duration-300 group-hover:scale-105">
      <span className="absolute inset-1 rounded-full border border-white/30" />
      <span className="text-[11px] font-bold tracking-tight">P</span>
    </span>
    <span className="leading-none">
      <span className="block text-base font-bold tracking-tight">Panda</span>
      <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.28em] text-primary/75 sm:block">Marketing</span>
    </span>
  </Link>
);

const links = [
  { to: "/", key: "nav.home" },
  { to: "/services", key: "nav.services" },
  { to: "/portfolio", key: "nav.portfolio" },
  { to: "/about", key: "nav.about" },
  { to: "/contact", key: "nav.contact" },
];

const Header = () => {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState({ x: 0, y: 0, width: 0, height: 0, ready: false });
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const pathname = usePathname();

  const setItemRef = (path: string) => (node: HTMLAnchorElement | null) => {
    itemRefs.current[path] = node;
  };

  const isActive = (linkTo: string) => {
    if (linkTo === "/") return pathname === "/";
    return pathname.startsWith(linkTo);
  };

  const handleNavClick = (path: string) => () => {
    setOpen(false);
    if (pathname === path) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  useEffect(() => { setOpen(false); }, [pathname]);
  useLayoutEffect(() => {
    const updatePill = () => {
      const nav = navRef.current;
      const active = itemRefs.current[links.find((link) => (link.to === "/" ? pathname === "/" : pathname.startsWith(link.to)))?.to ?? "/"];
      if (!nav || !active) return;
      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      setPill({
        x: activeRect.left - navRect.left,
        y: activeRect.top - navRect.top,
        width: activeRect.width,
        height: activeRect.height,
        ready: true,
      });
    };

    updatePill();
    const frame = window.requestAnimationFrame(updatePill);
    const resizeObserver = new ResizeObserver(updatePill);
    if (navRef.current) resizeObserver.observe(navRef.current);
    Object.values(itemRefs.current).forEach((item) => {
      if (item) resizeObserver.observe(item);
    });
    window.addEventListener("resize", updatePill);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePill);
    };
  }, [pathname, lang]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn(); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-cinematic]"));
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".cinematic-card"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.16 },
    );

    items.forEach((item) => {
      item.classList.add("cinematic-reveal");
      observer.observe(item);
    });

    const cleanups = cards.map((card) => {
      const onMove = (event: globalThis.MouseEvent) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--y", `${event.clientY - rect.top}px`);
      };
      card.addEventListener("mousemove", onMove);
      return () => card.removeEventListener("mousemove", onMove);
    });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return (
    <header className={cn(
      "sticky top-0 z-50 px-0 py-3 transition-all duration-300 md:py-4",
      scrolled ? "bg-transparent" : "bg-transparent"
    )}>
      <div
        className={cn(
          "container-x flex h-16 items-center justify-between rounded-none transition-all duration-300 md:h-[4.5rem]",
          scrolled
            ? "max-w-[1180px] rounded-full border border-white/10 bg-[#0B0B0B]/76 shadow-[0_22px_70px_hsl(0_0%_0%/0.42),0_0_40px_hsl(var(--primary)/0.06)] backdrop-blur-2xl"
            : "max-w-[1320px]"
        )}
      >
        <Logo />
        <nav ref={navRef} className="panda-nav-shell hidden items-center gap-1 rounded-full border border-white/10 bg-[#151515]/68 p-1.5 shadow-[0_14px_44px_hsl(0_0%_0%/0.22)] backdrop-blur-xl md:flex">
          <span
            className={cn("nav-liquid-pill", pill.ready && "is-ready")}
            aria-hidden="true"
            style={{
              "--pill-x": `${pill.x}px`,
              "--pill-y": `${pill.y}px`,
              "--pill-width": `${pill.width}px`,
              "--pill-height": `${pill.height}px`,
            } as CSSProperties}
          />
          {links.map(l => (
            <Link
              key={l.to}
              href={l.to}
              onClick={handleNavClick(l.to)}
              ref={setItemRef(l.to)}
              className={cn(
                "nav-link-item relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                isActive(l.to)
                  ? "is-active text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="theme-toggle h-10 w-10"
            aria-label={theme === "dark" ? t("aria.themeLight") : t("aria.themeDark")}
            title={theme === "dark" ? t("aria.themeLight") : t("aria.themeDark")}
          >
            {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
          <div className="flex items-center rounded-full border border-white/10 bg-[#151515]/78 p-0.5" role="group" aria-label={t("aria.langSwitcher")}>
            {(["ar", "en", "he"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "h-9 rounded-full px-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300",
                  lang === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={t(`aria.lang.${l}`)}
                aria-pressed={lang === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Button asChild size="sm" variant="ink" className="hidden md:inline-flex">
            <Link href="/contact">{t("cta.talk")}</Link>
          </Button>
          <button className="md:hidden icon-button size-10" onClick={() => setOpen(o => !o)} aria-label={t("aria.menu")}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0B0B]/95 backdrop-blur-xl">
          <div className="container-x py-5 flex flex-col gap-2">
            {links.map(l => (
              <Link
                key={l.to}
                href={l.to}
                onClick={handleNavClick(l.to)}
                className={cn(
                  "mobile-nav-link rounded-xl px-4 py-3 text-lg font-semibold transition-colors",
                  isActive(l.to) ? "is-active bg-primary text-primary-foreground" : "hover:bg-secondary"
                )}
              >
                {t(l.key)}
              </Link>
            ))}
            <Button asChild variant="ink" className="mt-2 w-full"><Link href="/contact">{t("cta.talk")}</Link></Button>
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => {
  const { t } = useI18n();
  return (
    <footer className="border-t border-white/10 bg-[#070707] text-foreground">
      <div className="container-x grid gap-10 py-12 text-center sm:text-start md:grid-cols-4 md:gap-12 md:py-20">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">P</span>
            <span className="text-lg font-bold">Panda</span>
          </Link>
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-muted-foreground sm:mx-0 md:mt-5 md:text-lg">{t("footer.tag")}</p>
        </div>
        <div>
          <p className="eyebrow">{t("nav.contact")}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground md:mt-5 md:space-y-3">
            <li><a href="tel:+972597228693" dir="ltr" className="inline-block transition-colors hover:text-primary">+972 597 228 693</a></li>
            <li><a href="mailto:panda.marketing111@gmail.com" dir="ltr" className="inline-block break-all transition-colors hover:text-primary">panda.marketing111@gmail.com</a></li>
            <li>{t("loc.hebron")}</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t("nav.services")}</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground sm:flex-col sm:justify-start sm:gap-x-0 sm:space-y-2.5 md:mt-5 md:space-y-3">
            {links.slice(1).map(l => (
              <li key={l.to}><Link href={l.to} className="transition-colors hover:text-primary">{t(l.key)}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-muted-foreground md:flex-row md:py-6">
          <span>&copy; {new Date().getFullYear()} Panda Marketing. {t("footer.rights")}</span>
          <span>{t("loc.hebron")}</span>
        </div>
      </div>
    </footer>
  );
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
