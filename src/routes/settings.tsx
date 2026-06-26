import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, fetchSettings, updateSettings, type AppSettings } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Verdant Academy" },
      { name: "description", content: "Institution preferences, terms, and notification settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin");
  const { data: settings, refetch } = useQuery(fetchSettings);
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  if (!form) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center text-soil/60">
          <Loader2 className="size-5 animate-spin" /> <span className="ml-2">Loading settings…</span>
        </div>
      </AppShell>
    );
  }

  const upd = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => setForm({ ...form, [k]: v });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    try {
      const { id: _id, ...rest } = form;
      await updateSettings(rest);
      toast.success("Settings saved");
      await refetch();
    } catch (err) {
      toast.error("Could not save: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm text-soil/60">Configuration</p>
        <h1 className="mt-1 font-display text-4xl text-soil">Settings</h1>
        <p className="mt-1 text-soil/70">
          Institution preferences and academic policies.{!canEdit && " (read-only — admin access required to edit)"}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <nav className="lg:col-span-1">
          <ul className="space-y-1 text-sm">
            {["Institution", "Academic terms", "Notifications", "Permissions", "Integrations"].map(
              (s, i) => (
                <li key={s}>
                  <a
                    className={
                      "block rounded-xl px-4 py-2.5 " +
                      (i === 0
                        ? "bg-fern text-primary-foreground font-medium"
                        : "text-soil/70 hover:bg-mist hover:text-fern")
                    }
                  >
                    {s}
                  </a>
                </li>
              ),
            )}
          </ul>
        </nav>

        <form onSubmit={save} className="lg:col-span-2 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-soil">Institution details</h2>
          <p className="text-sm text-soil/60">
            Used across reports, invoices and the student portal.
          </p>

          <fieldset disabled={!canEdit} className="contents">
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TxtField label="Institution name" value={form.institution_name} onChange={(v) => upd("institution_name", v)} />
              <TxtField label="Registrar" value={form.registrar ?? ""} onChange={(v) => upd("registrar", v)} />
              <TxtField label="Contact email" type="email" value={form.contact_email ?? ""} onChange={(v) => upd("contact_email", v)} />
              <TxtField label="Phone" value={form.phone ?? ""} onChange={(v) => upd("phone", v)} />
              <TxtField full label="Address" value={form.address ?? ""} onChange={(v) => upd("address", v)} />
              <SelField label="Academic year" options={["2023-2024","2024-2025","2025-2026","2026-2027"]} value={form.academic_year ?? ""} onChange={(v) => upd("academic_year", v)} />
              <SelField label="Default term" options={["Spring","Summer","Fall","Winter"]} value={form.default_term ?? ""} onChange={(v) => upd("default_term", v)} />
            </div>

            <div className="mt-8 border-t border-sprout/30 pt-6">
              <h3 className="font-semibold text-soil">Notifications</h3>
              <div className="mt-4 space-y-3">
                <Toggle label="Email weekly attendance digest" checked={form.notify_attendance_digest} onChange={(v) => upd("notify_attendance_digest", v)} />
                <Toggle label="Notify on overdue tuition" checked={form.notify_overdue_tuition} onChange={(v) => upd("notify_overdue_tuition", v)} />
                <Toggle label="SMS alerts to faculty" checked={form.notify_sms_faculty} onChange={(v) => upd("notify_sms_faculty", v)} />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving || !canEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-fern px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50"
              >
                <Save className="size-4" /> {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </AppShell>
  );
}

function TxtField({ label, value, onChange, type = "text", full }: { label: string; value: string; onChange: (v: string) => void; type?: string; full?: boolean; }) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="text-xs font-medium text-soil/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/50 px-3 py-2 text-sm outline-none focus:border-fern focus:bg-glass"
      />
    </label>
  );
}

function SelField({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void; }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-soil/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/50 px-3 py-2 text-sm outline-none focus:border-fern focus:bg-glass"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-mist/60 px-4 py-3">
      <span className="text-sm text-soil">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-5 w-9 rounded-full bg-sprout/40 transition-colors peer-checked:bg-fern after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}
