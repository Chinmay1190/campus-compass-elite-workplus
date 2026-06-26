import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Verdant Academy" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as "email" | "password"] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/profile" });
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-fern p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_40%),radial-gradient(circle_at_80%_80%,var(--gold)_0%,transparent_50%)]" />
        <div className="absolute -right-24 top-1/3 size-[420px] rounded-full border border-white/10" />
        <div className="absolute -right-40 top-1/3 size-[520px] rounded-full border border-white/5" />

        <div className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <div className="font-display text-xl leading-none">Verdant Academy</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/60">Student Management</div>
          </div>
        </div>

        <div className="relative space-y-6">
          <p className="font-display text-4xl leading-tight">
            Excellence, cultivated <span className="text-gold">one student</span> at a time.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            A unified platform for enrollment, attendance, academics and finance — built for modern institutions that value clarity and craft.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Feature icon={ShieldCheck} text="Secure, role-based access" />
            <Feature icon={Sparkles} text="Real-time insights" />
          </div>
        </div>

        <div className="relative text-xs text-white/50">© {new Date().getFullYear()} Verdant Academy. All rights reserved.</div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-mist p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-fern text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-display text-lg text-fern">Verdant Academy</span>
          </Link>

          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sprout/60 bg-glass px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-fern">
            <span className="size-1.5 rounded-full bg-gold" /> Member sign in
          </div>
          <h1 className="font-display text-4xl text-soil">Welcome back.</h1>
          <p className="mt-2 text-sm text-soil/65">
            Sign in to continue managing your academic ecosystem.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <Field
              label="Email address"
              icon={Mail}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@academy.edu"
              error={errors.email}
              autoComplete="email"
            />
            <Field
              label="Password"
              icon={Lock}
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-soil/50 hover:text-fern"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="inline-flex items-center gap-2 text-soil/65">
                <input type="checkbox" className="size-3.5 rounded border-sprout text-fern focus:ring-fern" />
                Remember me
              </label>
              <button type="button" className="font-medium text-fern hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fern px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition-all hover:bg-fern/90 hover:shadow-soft disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-soil/65">
            New to Verdant?{" "}
            <Link to="/signup" className="font-semibold text-fern hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur">
      <Icon className="size-4 text-gold" />
      <span className="text-xs text-white/80">{text}</span>
    </div>
  );
}

function Field({
  label, icon: Icon, type = "text", value, onChange, placeholder, error, autoComplete, trailing,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-soil/60">{label}</span>
      <div
        className={
          "mt-1.5 flex items-center gap-2 rounded-xl border bg-glass px-3 py-2.5 shadow-soft transition-all focus-within:border-fern focus-within:ring-2 focus-within:ring-fern/15 " +
          (error ? "border-destructive/60" : "border-sprout/70")
        }
      >
        <Icon className="size-4 shrink-0 text-soil/45" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-soil outline-none placeholder:text-soil/35"
        />
        {trailing}
      </div>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
