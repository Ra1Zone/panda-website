"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";

type Mode = "login" | "setup";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 1 minute

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [checking, setChecking] = useState(true);

  // ── Login state ────────────────────────────────────────────
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [failCount, setFailCount] = useState(0);

  // ── Setup state ────────────────────────────────────────────
  const [setupEmail, setSetupEmail] = useState("");
  const [setupPw, setSetupPw] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [showSetupPw, setShowSetupPw] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  // Check if setup is needed on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.needsSetup) {
          setMode("setup");
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!locked || !lockedUntil) return;
    const tick = () => {
      const r = Math.max(0, lockedUntil - Date.now());
      setRemaining(r);
      if (r === 0) {
        setLocked(false);
        setFailCount(0);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locked, lockedUntil]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (locked || loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credential.trim(), password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const newCount = failCount + 1;
        setFailCount(newCount);
        if (newCount >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS;
          setLocked(true);
          setLockedUntil(until);
        } else {
          setError("Invalid login credentials.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: FormEvent) => {
    e.preventDefault();
    setSetupError("");
    if (!setupEmail.trim()) { setSetupError("Email is required."); return; }
    if (setupPw.length < 12) { setSetupError("Password must be at least 12 characters."); return; }
    if (setupPw !== setupConfirm) { setSetupError("Passwords do not match."); return; }
    setSetupLoading(true);

    try {
      const setupRes = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: setupEmail.trim(), password: setupPw }),
      });

      if (!setupRes.ok) {
        setSetupLoading(false);
        setSetupError("Setup failed. Please try again.");
        return;
      }

      // Auto-login after setup
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: setupEmail.trim(), password: setupPw }),
      });

      setSetupLoading(false);

      if (loginRes.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setSetupError("Setup succeeded but login failed. Please sign in manually.");
        setMode("login");
      }
    } catch {
      setSetupLoading(false);
      setSetupError("Network error. Please try again.");
    }
  };

  const inputCls =
    "w-full h-12 rounded-xl border border-white/10 bg-[#111111] px-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50 focus:bg-[#141414] focus:ring-2 focus:ring-primary/10";

  const mins = Math.ceil(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  if (checking) {
    return (
      <div dir="ltr" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div dir="ltr" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-xl font-black text-primary-foreground shadow-[0_0_40px_hsl(134_39%_41%/0.3)]">
            P
          </div>
          <h1 className="text-xl font-bold text-white">Panda Admin</h1>
          <p className="mt-1 text-sm text-white/40">
            {mode === "setup" ? "Create your admin account" : "Sign in to manage website content"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0E0E0E] p-6 shadow-[0_32px_80px_hsl(0_0%_0%/0.5)]">

          {/* ── Lockout screen ── */}
          {mode === "login" && locked ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
                <Lock className="size-6 text-amber-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-amber-400">Account Temporarily Locked</p>
                <p className="mt-1 text-xs text-white/40">Too many failed attempts</p>
              </div>
              <p className="text-sm text-white/50">
                Too many failed attempts.{" "}
                {remaining > 0 ? `Try again in ${mins > 0 ? `${mins}m ` : ""}${secs}s.` : "Please wait."}
              </p>
            </div>

          /* ── Setup form (first run) ── */
          ) : mode === "setup" ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/8 px-4 py-3 text-xs text-primary/80">
                First-time setup — create your admin credentials.
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">Admin Email</label>
                <input
                  required
                  type="text"
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  className={inputCls}
                  autoComplete="email"
                  disabled={setupLoading}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">Password <span className="text-white/30">(min 12 characters)</span></label>
                <div className="relative">
                  <input
                    required
                    type={showSetupPw ? "text" : "password"}
                    value={setupPw}
                    onChange={(e) => setSetupPw(e.target.value)}
                    className={`${inputCls} pr-12`}
                    autoComplete="new-password"
                    disabled={setupLoading}
                  />
                  <button type="button" onClick={() => setShowSetupPw(!showSetupPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60" tabIndex={-1}
                    aria-label={showSetupPw ? "Hide password" : "Show password"}>
                    {showSetupPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">Confirm Password</label>
                <input
                  required
                  type="password"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  className={inputCls}
                  autoComplete="new-password"
                  disabled={setupLoading}
                />
              </div>
              {setupError && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{setupError}</p>
              )}
              <button type="submit" disabled={setupLoading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
                {setupLoading ? "Creating account..." : "Create Admin Account"}
              </button>
            </form>

          /* ── Normal login form ── */
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">Email</label>
                <input
                  required
                  type="text"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  className={inputCls}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/50">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} pr-12`}
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60" tabIndex={-1}
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
              )}
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
