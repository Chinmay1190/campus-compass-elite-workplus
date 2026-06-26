import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Save, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — Verdant Academy" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles, isAuthenticated, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFirstName(data.first_name ?? "");
          setLastName(data.last_name ?? "");
          setPhone(data.phone ?? "");
        }
      });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone })
      .eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  if (loading) return <AppShell><div className="text-soil/60">Loading…</div></AppShell>;

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm text-soil/60">Account</p>
        <h1 className="mt-1 font-display text-4xl text-soil">My Profile</h1>
        <p className="mt-1 text-soil/70">Personal information and account settings.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-sprout/40 text-2xl font-semibold text-fern">
              {(user?.email ?? "??").slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-4 text-lg font-semibold text-soil">
              {firstName || lastName ? `${firstName} ${lastName}` : user?.email}
            </h2>
            <p className="text-xs text-soil/60">{user?.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {roles.map((r) => (
                <span key={r} className="inline-flex items-center gap-1 rounded-full bg-fern/10 px-2.5 py-0.5 text-[11px] font-medium text-fern">
                  <ShieldCheck className="size-3" /> {r}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/login" });
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </aside>

        <form onSubmit={save} className="lg:col-span-2 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-soil">Personal details</h2>
          <p className="text-sm text-soil/60">Used in records, communications and reports.</p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="First name" value={firstName} onChange={setFirstName} />
            <Field label="Last name" value={lastName} onChange={setLastName} />
            <Field label="Email" value={user?.email ?? ""} onChange={() => {}} disabled />
            <Field label="Phone" value={phone} onChange={setPhone} />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
            >
              <Save className="size-4" /> {busy ? "Saving…" : "Save changes"}
            </button>
          </div>

          <p className="mt-6 text-xs text-soil/60">
            Need a different role? Contact an administrator. <Link to="/announcements" className="text-fern hover:underline">View announcements</Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-soil/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/50 px-3 py-2 text-sm outline-none focus:border-fern focus:bg-glass disabled:opacity-60"
      />
    </label>
  );
}
