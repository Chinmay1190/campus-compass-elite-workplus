import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Mail, Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import { useQuery, fetchTeachers, createTeacher, updateTeacher, deleteTeacher, type Teacher } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/teachers")({
  head: () => ({
    meta: [{ title: "Faculty — Verdant Academy" }],
  }),
  component: TeachersPage,
});

const emptyForm = {
  full_name: "",
  email: "",
  department: "",
  title: "Lecturer",
  joined_year: new Date().getFullYear(),
};

function TeachersPage() {
  const { data: teachers, refetch } = useQuery(fetchTeachers);
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin");
  const teacherCols: ExportColumn<Teacher>[] = [
    { header: "Staff No", accessor: (t) => t.staff_no },
    { header: "Name", accessor: (t) => t.full_name },
    { header: "Title", accessor: (t) => t.title },
    { header: "Department", accessor: (t) => t.department },
    { header: "Email", accessor: (t) => t.email },
    { header: "Joined", accessor: (t) => t.joined_year ?? "" },
  ];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (t: Teacher) => {
    setEditing(t);
    setForm({
      full_name: t.full_name,
      email: t.email,
      department: t.department,
      title: t.title,
      joined_year: t.joined_year ?? new Date().getFullYear(),
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, joined_year: Number(form.joined_year) };
      if (editing) {
        await updateTeacher(editing.id, payload);
        toast.success("Faculty member updated");
      } else {
        await createTeacher(payload);
        toast.success("Faculty member added");
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      toast.error("Could not save: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: Teacher) => {
    if (!confirm(`Remove ${t.full_name}? This cannot be undone.`)) return;
    try {
      await deleteTeacher(t.id);
      toast.success("Faculty member removed");
      await refetch();
    } catch (err) {
      toast.error("Could not delete: " + String(err));
    }
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Directory</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Faculty</h1>
          <p className="mt-1 text-soil/70">{teachers?.length ?? 0} active members</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu
            filename="faculty"
            title="Faculty Directory"
            subtitle={`${teachers?.length ?? 0} active members`}
            columns={teacherCols}
            rows={teachers}
          />
          {canEdit && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Plus className="size-4" /> Add member
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(teachers ?? []).map((t) => (
          <article key={t.id} className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-sprout/40 text-base font-semibold text-fern">
                {t.full_name.split(" ").slice(-2).map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-soil">{t.full_name}</h3>
                <p className="text-xs text-soil/60">{t.title}</p>
              </div>
              {canEdit && (
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => openEdit(t)} aria-label="Edit" className="rounded-lg p-1.5 text-soil/60 hover:bg-fern/10 hover:text-fern">
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => remove(t)} aria-label="Delete" className="rounded-lg p-1.5 text-soil/60 hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-sprout/30 pt-4 text-center">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-soil/60">Dept</dt>
                <dd className="mt-1 text-xs font-medium text-soil">{t.department}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-soil/60">Staff #</dt>
                <dd className="mt-1 text-xs font-medium text-soil">{t.staff_no}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-soil/60">Joined</dt>
                <dd className="mt-1 text-xs font-medium text-soil">{t.joined_year ?? "—"}</dd>
              </div>
            </dl>

            <a href={`mailto:${t.email}`} className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-fern hover:underline">
              <Mail className="size-3.5" /> {t.email}
            </a>
          </article>
        ))}
        {!teachers && <div className="text-sm text-soil/50">Loading…</div>}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Edit faculty member" : "Add faculty member"}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name">
            <input required className={inputClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department">
              <input required className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Field>
            <Field label="Title">
              <select className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}>
                <option>Lecturer</option>
                <option>Assistant Professor</option>
                <option>Associate Professor</option>
                <option>Professor</option>
              </select>
            </Field>
          </div>
          <Field label="Joined year">
            <input type="number" className={inputClass} value={form.joined_year} onChange={(e) => setForm({ ...form, joined_year: Number(e.target.value) })} />
          </Field>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add member"}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}
