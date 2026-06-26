import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Plus, ClipboardList, Award } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import { useQuery, fetchCourses, fetchExams, scheduleExam } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

type GradeRow = { student: string; exam: string; course: string; score: number; total: number; pct: string; grade: string; date: string };

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [{ title: "Exams & Grades — Verdant Academy" }],
  }),
  component: ExamsPage,
});

function letterGrade(pct: number) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B+";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function ExamsPage() {
  const { data: courses } = useQuery(fetchCourses);
  const { data: exams, refetch } = useQuery(fetchExams);
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin") || hasRole("teacher");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ course_id: "", title: "", exam_date: "", total_marks: 100 });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (exams ?? []).filter((e) => e.exam_date >= today).sort((a, b) => a.exam_date.localeCompare(b.exam_date));

  const recentGrades = useMemo(() => {
    const out: { student: string; exam: string; score: number; total: number; grade: string }[] = [];
    (exams ?? []).forEach((e) =>
      (e.grades ?? []).forEach((g) => {
        const pct = (Number(g.score) / e.total_marks) * 100;
        out.push({
          student: g.student?.full_name ?? "Student",
          exam: `${e.title} — ${e.course?.code ?? ""}`,
          score: Number(g.score),
          total: e.total_marks,
          grade: letterGrade(pct),
        });
      }),
    );
    return out.slice(0, 8);
  }, [exams]);

  const distribution = useMemo(() => {
    const buckets: Record<string, number> = { A: 0, "B+": 0, B: 0, C: 0, D: 0, F: 0 };
    let n = 0;
    (exams ?? []).forEach((e) =>
      (e.grades ?? []).forEach((g) => {
        const pct = (Number(g.score) / e.total_marks) * 100;
        buckets[letterGrade(pct)] += 1;
        n += 1;
      }),
    );
    return { buckets, n };
  }, [exams]);

  const allGrades: GradeRow[] = useMemo(() => {
    const out: GradeRow[] = [];
    (exams ?? []).forEach((e) =>
      (e.grades ?? []).forEach((g) => {
        const pct = (Number(g.score) / e.total_marks) * 100;
        out.push({
          student: g.student?.full_name ?? "Student",
          exam: e.title,
          course: e.course?.code ?? "",
          score: Number(g.score),
          total: e.total_marks,
          pct: pct.toFixed(1) + "%",
          grade: letterGrade(pct),
          date: e.exam_date,
        });
      }),
    );
    return out;
  }, [exams]);

  const gradeCols: ExportColumn<GradeRow>[] = [
    { header: "Student", accessor: (r) => r.student },
    { header: "Course", accessor: (r) => r.course },
    { header: "Exam", accessor: (r) => r.exam },
    { header: "Date", accessor: (r) => r.date },
    { header: "Score", accessor: (r) => `${r.score} / ${r.total}` },
    { header: "%", accessor: (r) => r.pct },
    { header: "Grade", accessor: (r) => r.grade },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id) return;
    setSaving(true);
    try {
      await scheduleExam({ ...form, total_marks: Number(form.total_marks) });
      toast.success("Exam scheduled");
      setOpen(false);
      setForm({ course_id: "", title: "", exam_date: "", total_marks: 100 });
      await refetch();
    } catch (err) {
      toast.error("Could not schedule exam: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const colors: Record<string, string> = {
    A: "bg-success",
    "B+": "bg-fern",
    B: "bg-fern/70",
    C: "bg-sprout",
    D: "bg-warning",
    F: "bg-destructive",
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Assessment</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Exams & Grades</h1>
          <p className="mt-1 text-soil/70">
            {upcoming.length} upcoming · {courses?.length ?? 0} active courses
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu
            filename="exam-results"
            title="Exam Results"
            subtitle={`${upcoming.length} upcoming · ${distribution.n} grades recorded`}
            columns={gradeCols}
            rows={allGrades}
            orientation="landscape"
          />
          {canEdit && (
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Plus className="size-4" /> Schedule exam
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
            <ClipboardList className="size-5 text-fern" /> Upcoming exams
          </h2>
          <ul className="mt-5 space-y-3">
            {upcoming.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sprout/30 bg-mist/40 px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-fern">{e.course?.code}</span>
                    <h3 className="text-sm font-medium text-soil">{e.title}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-soil/60">
                    {e.course?.title} · {e.total_marks} marks
                  </p>
                </div>
                <div className="rounded-lg bg-fern px-3 py-1.5 text-xs font-medium text-primary-foreground">
                  {new Date(e.exam_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </li>
            ))}
            {upcoming.length === 0 && <li className="text-sm text-soil/60">No upcoming exams scheduled.</li>}
          </ul>
        </section>

        <section className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
            <Award className="size-5 text-fern" /> Recent grades
          </h2>
          <ul className="mt-5 space-y-3">
            {recentGrades.map((g, i) => (
              <li key={i} className="rounded-xl bg-mist/40 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-soil">{g.student}</div>
                  <div className="rounded-md bg-fern px-2 py-0.5 text-xs font-semibold text-primary-foreground">{g.grade}</div>
                </div>
                <p className="text-xs text-soil/60">{g.exam}</p>
                <p className="mt-1 text-xs text-soil/70">{g.score} / {g.total} marks</p>
              </li>
            ))}
            {recentGrades.length === 0 && <li className="text-sm text-soil/60">No grades recorded yet.</li>}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-soil">Grade distribution (term)</h2>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Object.entries(distribution.buckets).map(([grade, count]) => {
            const pct = distribution.n ? Math.round((count / distribution.n) * 100) : 0;
            return (
              <div key={grade} className="rounded-xl bg-mist/60 p-4 text-center">
                <div className="font-display text-2xl text-fern">{pct}%</div>
                <div className="mt-1 text-xs text-soil/70">Grade {grade}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sprout/30">
                  <div className={`h-full ${colors[grade]}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Schedule exam">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Course">
            <select required className={inputClass} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Select a course…</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Title">
            <input required className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <input required type="date" className={inputClass} value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
            </Field>
            <Field label="Total marks">
              <input type="number" min={1} className={inputClass} value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })} />
            </Field>
          </div>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Schedule exam"}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}
