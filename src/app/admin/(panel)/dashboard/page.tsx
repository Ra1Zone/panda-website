"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Image, Star, Users, MessageSquare, CheckCircle2, ArrowUpRight } from "lucide-react";

interface DashboardStats {
  services: { length: number; active: number; items: never[] };
  portfolio: { length: number; active: number; items: never[] };
  testimonials: { length: number; active: number; items: never[] };
  brands: { length: number; active: number; items: never[] };
  submissions: { length: number; newCount: number; recent: Array<{ id: string; name: string; email: string; status: string }> };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/portfolio").then((r) => r.json()),
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/contact").then((r) => r.json()),
    ]).then(([services, portfolio, testimonials, brands, submissions]) => {
      const svcArr = Array.isArray(services) ? services : [];
      const portArr = Array.isArray(portfolio) ? portfolio : [];
      const testArr = Array.isArray(testimonials) ? testimonials : [];
      const brandArr = Array.isArray(brands) ? brands : [];
      const subArr = Array.isArray(submissions) ? submissions : [];

      setStats({
        services: { length: svcArr.length, active: svcArr.filter((s: { active: boolean }) => s.active).length, items: [] },
        portfolio: { length: portArr.length, active: portArr.filter((p: { active: boolean }) => p.active).length, items: [] },
        testimonials: { length: testArr.length, active: testArr.filter((t: { active: boolean }) => t.active).length, items: [] },
        brands: { length: brandArr.length, active: brandArr.filter((b: { active: boolean }) => b.active).length, items: [] },
        submissions: {
          length: subArr.length,
          newCount: subArr.filter((s: { status: string }) => s.status === "new").length,
          recent: subArr.slice(0, 5),
        },
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Services", value: stats.services.length, active: stats.services.active, icon: Briefcase, to: "/admin/services", color: "text-primary" },
    { label: "Portfolio Items", value: stats.portfolio.length, active: stats.portfolio.active, icon: Image, to: "/admin/portfolio", color: "text-blue-400" },
    { label: "Testimonials", value: stats.testimonials.length, active: stats.testimonials.active, icon: Star, to: "/admin/testimonials", color: "text-amber-400" },
    { label: "Brands", value: stats.brands.length, active: stats.brands.active, icon: Users, to: "/admin/brands", color: "text-purple-400" },
    { label: "Submissions", value: stats.submissions.length, active: stats.submissions.newCount, icon: MessageSquare, to: "/admin/contact", color: "text-rose-400", activeLabel: "new" },
  ];

  const recentSubmissions = stats.submissions.recent;

  return (
    <div className="p-6 space-y-8 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/45">Overview of your website content</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ label, value, active, icon: Icon, to, color, activeLabel }) => (
          <Link
            key={label}
            href={to}
            className="group rounded-2xl border border-white/8 bg-[#111111] p-5 transition-all hover:border-white/15 hover:bg-[#141414]"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl border border-white/8 bg-white/5 p-2.5 ${color}`}>
                <Icon className="size-5" />
              </div>
              <ArrowUpRight className="size-4 text-white/20 transition-colors group-hover:text-primary" />
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-0.5 text-sm text-white/45">{label}</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary/70" />
              <span className="text-[11px] text-white/40">
                {active} {activeLabel ?? "active"}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent submissions */}
        <div className="rounded-2xl border border-white/8 bg-[#111111]">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <h2 className="text-sm font-semibold text-white">Recent Contact Submissions</h2>
            <Link href="/admin/contact" className="text-xs text-primary hover:underline">View all &rarr;</Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <p className="px-6 py-8 text-sm text-white/35 text-center">No submissions yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {recentSubmissions.map((s) => (
                <li key={s.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{s.name}</p>
                    <p className="truncate text-xs text-white/40">{s.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    s.status === "new"
                      ? "bg-blue-500/15 text-blue-400"
                      : s.status === "replied"
                      ? "bg-primary/15 text-primary"
                      : "bg-white/8 text-white/40"
                  }`}>
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-white/8 bg-[#111111]">
          <div className="border-b border-white/8 px-6 py-4">
            <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="divide-y divide-white/5">
            {[
              { label: "Edit homepage hero & stats", to: "/admin/home" },
              { label: "Add new portfolio project", to: "/admin/portfolio" },
              { label: "Add new service", to: "/admin/services" },
              { label: "Manage testimonials", to: "/admin/testimonials" },
              { label: "Update site settings", to: "/admin/settings" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                href={to}
                className="flex items-center justify-between px-6 py-3.5 text-sm text-white/60 transition-colors hover:bg-white/4 hover:text-white"
              >
                {label}
                <ArrowUpRight className="size-3.5 text-white/25" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
