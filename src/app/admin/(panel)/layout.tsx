"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Home, Settings2, Briefcase, Image, Users, Star,
  Phone, LogOut, Menu, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/home", icon: Home, label: "Home" },
  { to: "/admin/services", icon: Briefcase, label: "Services" },
  { to: "/admin/portfolio", icon: Image, label: "Portfolio" },
  { to: "/admin/about", icon: Users, label: "About" },
  { to: "/admin/testimonials", icon: Star, label: "Testimonials" },
  { to: "/admin/brands", icon: Users, label: "Brands" },
  { to: "/admin/contact", icon: Phone, label: "Contact" },
  { to: "/admin/settings", icon: Settings2, label: "Settings" },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.email) {
          setUsername(data.email);
        } else if (data.username) {
          setUsername(data.username);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground">P</div>
        <div>
          <p className="text-sm font-bold tracking-wide text-white">Panda Admin</p>
          <p className="text-[10px] text-white/40">Content Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map(({ to, icon: Icon, label }) => {
          const isActive = pathname === to || (to !== "/admin" && pathname.startsWith(to + "/"));
          return (
            <Link
              key={to}
              href={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive ? "bg-primary/15 text-primary" : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="size-3.5 text-primary/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {username ? username.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{username || "Admin"}</p>
            <p className="text-[10px] text-white/40">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/45 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    // Force LTR layout for admin regardless of public site language setting
    <div dir="ltr" data-theme="dark" data-admin-panel className="dark fixed inset-0 z-50 flex overflow-hidden bg-[#0A0A0A] text-white" style={{ colorScheme: "dark" }}>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/8 bg-[#0D0D0D] lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/8 bg-[#0D0D0D]" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/8 bg-[#0D0D0D] px-5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/8 hover:text-white lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <Link href="/" target="_blank" className="ml-auto text-xs text-white/35 hover:text-primary">
            View site &#x2197;
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
