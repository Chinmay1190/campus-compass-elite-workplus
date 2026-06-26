import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Save } from "lucide-react";

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
  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm text-soil/60">Configuration</p>
        <h1 className="mt-1 font-display text-4xl text-soil">Settings</h1>
        <p className="mt-1 text-soil/70">Institution preferences and academic policies.</p>
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

        <form className="lg:col-span-2 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-soil">Institution details</h2>
          <p className="text-sm text-soil/60">
            Used across reports, invoices and the student portal.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Institution name" defaultValue="Verdant Academy" />
            <Field label="Registrar" defaultValue="Dr. Maren Holt" />
            <Field label="Contact email" type="email" defaultValue="registrar@verdant.edu" />
            <Field label="Phone" defaultValue="+1 (415) 555-0102" />
            <Field
              label="Address"
              defaultValue="1248 Greenleaf Way, Sausalito, CA"
              full
            />
            <SelectField
              label="Academic year"
              options={["2023–2024", "2024–2025", "2025–2026"]}
              defaultValue="2024–2025"
            />
            <SelectField
              label="Default term"
              options={["Spring", "Summer", "Fall", "Winter"]}
              defaultValue="Fall"
            />
          </div>

          <div className="mt-8 border-t border-sprout/30 pt-6">
            <h3 className="font-semibold text-soil">Notifications</h3>
            <div className="mt-4 space-y-3">
              <Toggle label="Email weekly attendance digest" defaultChecked />
              <Toggle label="Notify on overdue tuition" defaultChecked />
              <Toggle label="SMS alerts to faculty" />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Save className="size-4" /> Save changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  full,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  full?: boolean;
}) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="text-xs font-medium text-soil/70">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/50 px-3 py-2 text-sm outline-none focus:border-fern focus:bg-glass"
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  defaultValue,
}: {
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-soil/70">{label}</span>
      <select
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/50 px-3 py-2 text-sm outline-none focus:border-fern focus:bg-glass"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-mist/60 px-4 py-3">
      <span className="text-sm text-soil">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-5 w-9 rounded-full bg-sprout/40 transition-colors peer-checked:bg-fern after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  );
}
