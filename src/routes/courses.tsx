import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Plus, Users, Clock, BookOpen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import { useQuery, fetchCourses, fetchTeachers, createCourse, updateCourse, deleteCourse, type Course } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [{ title: "Course Catalog — Verdant Academy" }],
  }),
  component: CoursesPage,
});

const emptyForm = {
  code: "",
  title: "",
  department: "",
  credits: 3,
  capacity: 30,
  schedule: "",
  instructor_id: "",
};

function CoursesPage() {
  const { data: courses, refetch } = useQuery(fetchCourses);
  const { data: teachers } = useQuery(fetchTeachers);
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin") || hasRole("teacher");
  const courseCols: ExportColumn<Course>[] = [
    { header: "Code", accessor: (c) => c.code },
    { header: "Title", accessor: (c) => c.title },
    { header: "Department", accessor: (c) => c.department },
    { header: "Credits", accessor: (c) => c.credits },
    { header: "Instructor", accessor: (c) => c.instructor?.full_name ?? "" },
    { header: "Schedule", accessor: (c) => c.schedule ?? "" },
    { header: "Enrolled", accessor: (c) => `${c.enrolled_count ?? 0} / ${c.capacity}` },
  ];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      code: c.code,
      title: c.title,
      department: c.department,
      credits: c.credits,
      capacity: c.capacity,
      schedule: c.schedule ?? "",
      instructor_id: c.instructor_id ?? "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        title: form.title,
        department: form.department,
        credits: Number(form.credits),
        capacity: Number(form.capacity),
        schedule: form.schedule || null,
        instructor_id: form.instructor_id || null,
      };
      if (editing) {
        await updateCourse(editing.id, payload);
        toast.success("Course updated");
      } else {
        await createCourse(payload);
        toast.success("Course created");
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

  const remove = async (c: Course) => {
    if (!confirm(`Delete course ${c.code} — ${c.title}?`)) return;
    try {
      await deleteCourse(c.id);
      toast.success("Course deleted");
      await refetch();
    } catch (err) {
      toast.error("Could not delete: " + String(err));
    }
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Catalog</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Course Catalog</h1>
          <p className="mt-1 text-soil/70">
            {courses?.length ?? 0} courses · {(courses ?? []).reduce((a, c) => a + (c.enrolled_count ?? 0), 0)} enrollments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu
            filename="courses"
            title="Course Catalog"
            subtitle={`${courses?.length ?? 0} courses · ${(courses ?? []).reduce((a, c) => a + (c.enrolled_count ?? 0), 0)} enrollments`}
            columns={courseCols}
            rows={courses}
            orientation="landscape"
          />
          {canEdit && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90">
              <Plus className="size-4" /> New course
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(courses ?? []).map((c) => {
          const fillPct = ((c.enrolled_count ?? 0) / c.capacity) * 100;
          return (
            <article
              key={c.id}
              className="group rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-fern">{c.code}</span>
                  <h3 className="mt-1 text-lg font-semibold text-soil">{c.title}</h3>
                  <p className="text-xs text-soil/60">{c.department}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {canEdit && (
                    <>
                      <button onClick={() => openEdit(c)} aria-label="Edit" className="rounded-lg p-1.5 text-soil/60 hover:bg-fern/10 hover:text-fern">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(c)} aria-label="Delete" className="rounded-lg p-1.5 text-soil/60 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                  <span className="ml-1 flex size-10 items-center justify-center rounded-xl bg-sprout/30 text-fern">
                    <BookOpen className="size-5" />
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm text-soil/80">
                Led by <span className="font-medium text-fern">{c.instructor?.full_name ?? "—"}</span>
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-mist px-3 py-2">
                  <div className="text-soil/60">Credits</div>
                  <div className="mt-0.5 font-semibold text-soil">{c.credits}</div>
                </div>
                <div className="rounded-lg bg-mist px-3 py-2">
                  <div className="inline-flex items-center gap-1 text-soil/60">
                    <Clock className="size-3" /> Schedule
                  </div>
                  <div className="mt-0.5 font-semibold text-soil">{c.schedule ?? "TBA"}</div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-soil/70">
                    <Users className="size-3" /> Enrollment
                  </span>
                  <span className="font-medium text-soil">{c.enrolled_count ?? 0}/{c.capacity}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sprout/30">
                  <div className="h-full rounded-full bg-fern transition-all" style={{ width: `${fillPct}%` }} />
                </div>
              </div>
            </article>
          );
        })}
        {!courses && <div className="text-sm text-soil/50">Loading…</div>}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Edit course" : "New course"}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Code">
              <input required className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </Field>
            <Field label="Department">
              <input required className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </Field>
          </div>
          <Field label="Title">
            <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Instructor">
            <select className={inputClass} value={form.instructor_id} onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}>
              <option value="">Unassigned</option>
              {(teachers ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Schedule">
            <input className={inputClass} placeholder="Mon/Wed 09:00-10:30" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Credits">
              <input type="number" min={1} className={inputClass} value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} />
            </Field>
            <Field label="Capacity">
              <input type="number" min={1} className={inputClass} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </Field>
          </div>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Create course"}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}
