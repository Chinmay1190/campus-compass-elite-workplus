import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, ShieldCheck, Sparkles, BookOpen, MailCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Verdant Academy" }] }),
  component: SignupPage,
});

const schema = z
  .object({
    firstName: z.string().trim().min(1, "Required").max(50),
    lastName: z.string().trim().min(1, "Required").max(50),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(8, "Minimum 8 characters").max(128),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function SignupPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pwScore = useMemo(() => strength(password), [password]);
  const pwLabel = ["Too weak", "Weak", "Fair", "Strong", "Excellent"][pwScore];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ firstName, lastName, email, password, confirm });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrors(fe);
      return;
    }
    if (!agree) {
      setErrors({ agree: "Please accept the terms to continue" });
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Auto-confirm is on → user gets a session immediately.
    if (data.session) {
      toast.success("Welcome to Verdant Academy");
      navigate({ to: "/profile" });
      return;
    }
    toast.success("Check your inbox to confirm your email");
    setSent(true);
  };


  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-fern p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(circle_at_70%_20%,white_0%,transparent_40%),radial-gradient(circle_at_15%_85%,var(--gold)_0%,transparent_50%)]" />
        <div className="absolute -left-24 top-1/4 size-[420px] rounded-full border border-white/10" />

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
            Begin your journey with <span className="text-gold">distinction.</span>
          </p>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Join thousands of educators, students and administrators shaping the next generation of learning.
          </p>
          <ul className="space-y-2.5 pt-2 text-sm text-white/85">
            {[
              "Personalised dashboards for every role",
              "Bank-grade security & data isolation",
              "Integrated academics and finance",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-gold/20 ring-1 ring-gold/40">
                  <Check className="size-3 text-gold" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Feature icon={ShieldCheck} text="Privacy by default" />
            <Feature icon={Sparkles} text="Modern, intuitive UX" />
          </div>
        </div>

        <div className="relative text-xs text-white/50">© {new Date().getFullYear()} Verdant Academy.</div>
      </aside>

      <main className="flex items-center justify-center bg-mist p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-fern text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-display text-lg text-fern">Verdant Academy</span>
          </Link>

          {sent ? (
            <div className="rounded-2xl border border-sprout/60 bg-glass p-8 text-center shadow-elevated">
              <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-fern/10 text-fern ring-1 ring-fern/20">
                <MailCheck className="size-7" />
              </div>
              <h1 className="font-display text-3xl text-soil">Confirm your email</h1>
              <p className="mt-3 text-sm leading-relaxed text-soil/70">
                We've sent a confirmation link to{" "}
                <span className="font-medium text-soil">{email}</span>. Click it to verify your
                address, then sign in to complete your enrolment.
              </p>
              <Link
                to="/login"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fern px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elevated hover:bg-fern/90"
              >
                Go to sign in <ArrowRight className="size-4" />
              </Link>
              <p className="mt-5 text-xs text-soil/55">
                Didn't get the email? Check your spam folder, or{" "}
                <button onClick={() => setSent(false)} className="font-medium text-fern hover:underline">try again</button>.
              </p>
            </div>
          ) : (
          <>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sprout/60 bg-glass px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-fern">
            <BookOpen className="size-3" /> New enrolment
          </div>
          <h1 className="font-display text-4xl text-soil">Create your account.</h1>
          <p className="mt-2 text-sm text-soil/65">
            After signing up, we'll email you a confirmation link. Verify it and sign in to access your profile.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" icon={User} value={firstName} onChange={setFirstName} error={errors.firstName} autoComplete="given-name" />
              <Field label="Last name" icon={User} value={lastName} onChange={setLastName} error={errors.lastName} autoComplete="family-name" />
            </div>
            <Field label="Email address" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="you@academy.edu" error={errors.email} autoComplete="email" />

            <div>
              <Field
                label="Password"
                icon={Lock}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                error={errors.password}
                autoComplete="new-password"
                trailing={
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="text-soil/50 hover:text-fern" aria-label="Toggle password">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={
                          "h-1 flex-1 rounded-full transition-colors " +
                          (i < pwScore
                            ? pwScore <= 1 ? "bg-destructive" : pwScore === 2 ? "bg-warning" : "bg-success"
                            : "bg-sprout/50")
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-soil/60">{pwLabel}</span>
                </div>
              )}
            </div>

            <Field
              label="Confirm password"
              icon={Lock}
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat password"
              error={errors.confirm}
              autoComplete="new-password"
            />

            <label className="flex items-start gap-2.5 pt-1 text-xs text-soil/70">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 size-3.5 rounded border-sprout text-fern focus:ring-fern"
              />
              <span>
                I agree to the <a className="font-medium text-fern hover:underline">Terms of Service</a> and{" "}
                <a className="font-medium text-fern hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}

            <button
              type="submit"
              disabled={busy}
              className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-fern px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elevated transition-all hover:bg-fern/90 disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Create account"}
              {!busy && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-soil/65">
            Already have one?{" "}
            <Link to="/login" className="font-semibold text-fern hover:underline">
              Sign in
            </Link>
          </p>
          </>
          )}
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
