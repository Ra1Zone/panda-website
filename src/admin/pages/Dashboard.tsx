import { servicesStore, portfolioStore, testimonialsStore, brandsStore, contactStore } from "@/store/dataStore";
import { Briefcase, Image, Star, Users, MessageSquare, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const services = servicesStore.getAll();
  const portfolio = portfolioStore.getAll();
  const testimonials = testimonialsStore.getAll();
  const brands = brandsStore.getAll();
  const submissions = contactStore.getAll();
  const newSubmissions = submissions.filter((s) => s.status === "new").length;

  const stats = [
    { label: "Services", value: services.length, active: services.filter((s) => s.active).length, icon: Briefcase, to: "/admin/services", color: "text-primary" },
    { label: "Portfolio Items", value: portfolio.length, active: portfolio.filter((p) => p.active).length, icon: Image, to: "/admin/portfolio", color: "text-blue-400" },
    { label: "Testimonials", value: testimonials.length, active: testimonials.filter((t) => t.active).length, icon: Star, to: "/admin/testimonials", color: "text-amber-400" },
    { label: "Brands", value: brands.length, active: brands.filter((b) => b.active).length, icon: Users, to: "/admin/brands", color: "text-purple-400" },
    { label: "Submissions", value: submissions.length, active: newSubmissions, icon: MessageSquare, to: "/admin/contact", color: "text-rose-400", activeLabel: "new" },
  ];

  const recentSubmissions = submissions.slice(0, 5);

  return (
    <div className="p-6 space-y-8 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/45">Overview of your website content</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, active, icon: Icon, to, color, activeLabel }) => (
          <Link
            key={label}
            to={to}
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
            <Link to="/admin/contact" className="text-xs text-primary hover:underline">View all →</Link>
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
                to={to}
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
};

export default Dashboard;
