import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { Plus, Filter, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import {
  useQuery,
  fetchStudents,
  fetchCourses,
  createStudent,
  updateStudent,
  deleteStudent,
  type Student,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/students")({
  head: () => ({
    meta: [{ title: "Student Records — Verdant Academy" }],
  }),
  component: StudentsPage,
});

const filters = ["All", "Active", "Pending", "On Leave", "Graduated"] as const;

const emptyForm = { full_name: "", email: "", course_id: "", year: 1, status: "Active" };

function StudentsPage() {
  const { data: students, refetch } = useQuery(fetchStudents);
  const { data: courses } = useQuery(fetchCourses);
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin") || hasRole("teacher");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (s: Student) => {
    setEditing(s);
    setForm({
      full_name: s.full_name,
      email: s.email,
      course_id: s.course_id ?? "",
      year: s.year,
      status: s.status,
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        course_id: form.course_id || null,
        year: Number(form.year),
        status: form.status,
      };
      if (editing) {
        await updateStudent(editing.id, payload);
        toast.success("Student updated");
      } else {
        await createStudent(payload);
        toast.success("Student enrolled");
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

  const remove = async (s: Student) => {
    if (!confirm(`Delete ${s.full_name}? This cannot be undone.`)) return;
    try {
      await deleteStudent(s.id);
      toast.success("Student removed");
      await refetch();
    } catch (err) {
      toast.error("Could not delete: " + String(err));
    }
  };

  const exportCols: ExportColumn<Student>[] = [
    { header: "Student No", accessor: (s) => s.student_no },
    { header: "Name", accessor: (s) => s.full_name },
    { header: "Email", accessor: (s) => s.email },
    { header: "Course", accessor: (s) => s.course?.title ?? "" },
    { header: "Year", accessor: (s) => s.year },
    { header: "GPA", accessor: (s) => (s.gpa ? Number(s.gpa).toFixed(2) : "") },
    { header: "Enrolled", accessor: (s) => s.enrolled_on },
    { header: "Status", accessor: (s) => s.status },
  ];

  const filtered = useMemo(() => {
    return (students ?? []).filter((s: Student) => {
      const matchesQuery =
        !query ||
        s.full_name.toLowerCase().includes(query.toLowerCase()) ||
        s.student_no.toLowerCase().includes(query.toLowerCase()) ||
        (s.course?.title ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || s.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [students, query, filter]);

  const total = students?.length ?? 0;
  const active = students?.filter((s) => s.status === "Active").length ?? 0;

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Records</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Student Records</h1>
          <p className="mt-1 text-soil/70">
            {total} enrolled · {active} active this term
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu
            filename="students"
            title="Student Roster"
            subtitle={`${total} enrolled · ${active} active${filter !== "All" ? ` · filter: ${filter}` : ""}`}
            columns={exportCols}
            rows={filtered}
            orientation="landscape"
          />
          {canEdit && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90">
              <Plus className="size-4" /> Enroll student
            </button>
          )}
        </div>
      </header>

      <div className="rounded-2xl border border-sprout/30 bg-glass p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soil/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID, or course"
              className="w-full rounded-xl border border-sprout/40 bg-mist/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-fern focus:bg-glass"
            />
          </div>
          <div className="inline-flex items-center gap-1 rounded-xl border border-sprout/40 bg-mist/60 p-1">
            <Filter className="ml-2 size-4 text-soil/50" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors " +
                  (filter === f
                    ? "bg-fern text-primary-foreground"
                    : "text-soil/70 hover:text-fern")
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-soil/60">
              <tr className="border-b border-sprout/30">
                <th className="py-3 pr-4 font-medium">Student</th>
                <th className="py-3 pr-4 font-medium">Course</th>
                <th className="py-3 pr-4 font-medium">Year</th>
                <th className="py-3 pr-4 font-medium">GPA</th>
                <th className="py-3 pr-4 font-medium">Enrolled</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                {canEdit && <th className="py-3 pr-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-sprout/20">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-mist/40">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-sprout/40 text-xs font-semibold text-fern">
                        {s.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-soil">{s.full_name}</div>
                        <div className="text-xs text-soil/60">{s.student_no} · {s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-soil/80">{s.course?.title ?? "—"}</td>
                  <td className="py-3.5 pr-4 text-soil/70">Year {s.year}</td>
                  <td className="py-3.5 pr-4 font-medium text-soil">
                    {s.gpa && Number(s.gpa) > 0 ? Number(s.gpa).toFixed(2) : "—"}
                  </td>
                  <td className="py-3.5 pr-4 text-soil/60">{s.enrolled_on}</td>
                  <td className="py-3.5 pr-4"><StatusBadge status={s.status} /></td>
                  {canEdit && (
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} aria-label="Edit" className="rounded-lg p-1.5 text-soil/60 hover:bg-fern/10 hover:text-fern">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => remove(s)} aria-label="Delete" className="rounded-lg p-1.5 text-soil/60 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {students && filtered.length === 0 && (
                <tr><td colSpan={canEdit ? 7 : 6} className="py-10 text-center text-sm text-soil/60">No students match.</td></tr>
              )}
              {!students && (
                <tr><td colSpan={canEdit ? 7 : 6} className="py-10 text-center text-sm text-soil/50">Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Edit student" : "Enroll student"}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name">
            <input required className={inputClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Course">
            <select className={inputClass} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">No course yet</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Year">
              <select className={inputClass} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
                {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Active</option>
                <option>Pending</option>
                <option>On Leave</option>
                <option>Graduated</option>
              </select>
            </Field>
          </div>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Enroll student"}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-success/15 text-success",
    Pending: "bg-warning/20 text-warning-foreground",
    Graduated: "bg-sprout/40 text-fern",
    "On Leave": "bg-soil/10 text-soil/70",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-mist text-soil"}`}>
      {status}
    </span>
  );
}
