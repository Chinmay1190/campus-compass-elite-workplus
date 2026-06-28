import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Plus, ClipboardList, Award, BookOpenCheck, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import {
  useQuery,
  useRealtime,
  fetchCourses,
  fetchExams,
  scheduleExam,
  fetchExamRoster,
  recordGradesBulk,
  type Student,
} from "@/lib/api";
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
  useRealtime("exams-feed", ["exams", "grades"], () => { refetch(); });
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin") || hasRole("teacher");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---- Gradebook modal ---- */
  const [gbExamId, setGbExamId] = useState<string | null>(null);
  const [gbRoster, setGbRoster] = useState<{ student: Student; score: number | null; grade_id: string | null }[]>([]);
  const [gbExam, setGbExam] = useState<{ id: string; title: string; total_marks: number; course?: { code: string; title: string } | null } | null>(null);
  const [gbInputs, setGbInputs] = useState<Record<string, string>>({});
  const [gbSaving, setGbSaving] = useState(false);
  const [gbSearch, setGbSearch] = useState("");
  const [gbFilter, setGbFilter] = useState<"all" | "graded" | "ungraded">("all");
  const [gbPage, setGbPage] = useState(1);
  const gbPageSize = 15;

  useEffect(() => {
    if (!gbExamId) return;
    fetchExamRoster(gbExamId).then(({ exam, rows }) => {
      setGbExam(exam as never);
      setGbRoster(rows);
      const init: Record<string, string> = {};
      rows.forEach((r) => { init[r.student.id] = r.score != null ? String(r.score) : ""; });
      setGbInputs(init);
      setGbSearch("");
      setGbFilter("all");
      setGbPage(1);
    });
  }, [gbExamId]);

  const gbFiltered = useMemo(() => {
    const q = gbSearch.trim().toLowerCase();
    return gbRoster.filter((r) => {
      if (q && !`${r.student.full_name} ${r.student.student_no} ${r.student.email}`.toLowerCase().includes(q)) return false;
      const hasScore = (gbInputs[r.student.id] ?? "") !== "";
      if (gbFilter === "graded" && !hasScore) return false;
      if (gbFilter === "ungraded" && hasScore) return false;
      return true;
    });
  }, [gbRoster, gbSearch, gbFilter, gbInputs]);

  const gbPageCount = Math.max(1, Math.ceil(gbFiltered.length / gbPageSize));
  const gbPaged = useMemo(
    () => gbFiltered.slice((gbPage - 1) * gbPageSize, gbPage * gbPageSize),
    [gbFiltered, gbPage],
  );
  useEffect(() => { if (gbPage > gbPageCount) setGbPage(gbPageCount); }, [gbPageCount, gbPage]);

  const gbGradedCount = useMemo(
    () => gbRoster.filter((r) => (gbInputs[r.student.id] ?? "") !== "").length,
    [gbRoster, gbInputs],
  );

  const gbAvg = useMemo(() => {
    const scores = Object.values(gbInputs).map(Number).filter((n) => !Number.isNaN(n) && n > 0);
    if (!scores.length || !gbExam) return null;
    const avgRaw = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { score: avgRaw, pct: (avgRaw / gbExam.total_marks) * 100, count: scores.length };
  }, [gbInputs, gbExam]);

  const submitGradebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbExamId || !gbExam) return;
    setGbSaving(true);
    try {
      const rows = gbRoster
        .map((r) => ({ student_id: r.student.id, raw: gbInputs[r.student.id] }))
        .filter((r) => r.raw !== "" && r.raw != null)
        .map((r) => ({
          exam_id: gbExamId,
          student_id: r.student_id,
          score: Math.max(0, Math.min(gbExam.total_marks, Number(r.raw))),
        }));
      await recordGradesBulk(rows);
      toast.success(`Saved ${rows.length} grade${rows.length === 1 ? "" : "s"}`);
      setGbExamId(null);
      await refetch();
    } catch (err) {
      toast.error("Could not save grades: " + String(err));
    } finally {
      setGbSaving(false);
    }
  };

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    exam_date: "",
    start_time: "09:00",
    duration_minutes: 90,
    total_marks: 100,
    location: "",
    instructions: "",
  });

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
      await scheduleExam({
        course_id: form.course_id,
        title: form.title,
        exam_date: form.exam_date,
        total_marks: Number(form.total_marks),
        duration_minutes: Number(form.duration_minutes) || null,
        start_time: form.start_time || null,
        location: form.location || null,
        instructions: form.instructions || null,
      });
      toast.success("Exam scheduled");
      setOpen(false);
      setForm({ course_id: "", title: "", exam_date: "", start_time: "09:00", duration_minutes: 90, total_marks: 100, location: "", instructions: "" });
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
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sprout/30 bg-mist/40 px-4 py-3 transition hover:border-fern/40 hover:bg-mist">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-fern">{e.course?.code}</span>
                    <h3 className="text-sm font-medium text-soil">{e.title}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-soil/60">
                    {e.course?.title} · {e.total_marks} marks
                    {e.start_time ? ` · ${e.start_time.slice(0,5)}` : ""}
                    {e.duration_minutes ? ` · ${e.duration_minutes} min` : ""}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setGbExamId(e.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-sprout/40 bg-glass px-2.5 py-1 text-xs font-medium text-soil hover:text-fern"
                    >
                      <BookOpenCheck className="size-3.5" /> Gradebook
                    </button>
                  )}
                  <div className="rounded-lg bg-fern px-3 py-1.5 text-xs font-medium text-primary-foreground">
                    {new Date(e.exam_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </li>
            ))}
            {upcoming.length === 0 && <li className="text-sm text-soil/60">No upcoming exams scheduled.</li>}
          </ul>
          {canEdit && (exams ?? []).filter((e) => e.exam_date < today).length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-soil/60">Past exams · grade entry</h3>
              <ul className="mt-3 space-y-2">
                {(exams ?? []).filter((e) => e.exam_date < today).slice(0, 6).map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-xl bg-mist/40 px-4 py-2.5">
                    <div>
                      <div className="text-sm font-medium text-soil">{e.title}</div>
                      <div className="text-xs text-soil/60">{e.course?.code} · {e.exam_date} · {(e.grades?.length ?? 0)} graded</div>
                    </div>
                    <button onClick={() => setGbExamId(e.id)} className="rounded-lg border border-sprout/40 bg-glass px-2.5 py-1 text-xs font-medium text-soil hover:text-fern">
                      Open gradebook
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
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

      <Modal size="lg" open={open} onClose={() => setOpen(false)} title="Schedule new exam">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Course">
            <select required className={inputClass} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Select a course…</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Exam title">
            <input required placeholder="Midterm · Final · Quiz 2" className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <input required type="date" min={new Date().toISOString().slice(0,10)} className={inputClass} value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
            </Field>
            <Field label="Start time">
              <input type="time" className={inputClass} value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration (minutes)">
              <input type="number" min={15} step={15} className={inputClass} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
            </Field>
            <Field label="Total marks">
              <input type="number" min={1} className={inputClass} value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Location / Room">
            <input className={inputClass} placeholder="Hall B · Room 305" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Instructions for students">
            <textarea rows={3} className={inputClass} placeholder="Permitted materials, calculator policy, ID required…" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </Field>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Schedule exam"}
          </button>
        </form>
      </Modal>

      <Modal size="xl" open={!!gbExamId} onClose={() => setGbExamId(null)} title={gbExam ? `Gradebook · ${gbExam.title}` : "Gradebook"}>
        <form onSubmit={submitGradebook} className="space-y-4">
          {gbExam && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-mist/60 px-4 py-3 text-xs text-soil/70">
              <span>
                <strong className="text-soil">{gbExam.course?.code}</strong> · {gbRoster.length} students · {gbExam.total_marks} marks max
              </span>
              {gbAvg && (
                <span>
                  Class avg: <strong className="text-fern">{gbAvg.score.toFixed(1)}</strong> ({gbAvg.pct.toFixed(0)}%) across {gbAvg.count}
                </span>
              )}
            </div>
          )}
          <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-sprout/30">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-mist/80 text-left text-xs uppercase tracking-wider text-soil/60">
                <tr>
                  <th className="py-2 pl-4 pr-3">Student</th>
                  <th className="py-2 px-3 w-32">Score</th>
                  <th className="py-2 px-3 w-20 text-right">%</th>
                  <th className="py-2 pr-4 pl-3 w-20 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sprout/20">
                {gbRoster.map((r) => {
                  const raw = gbInputs[r.student.id] ?? "";
                  const n = Number(raw);
                  const ok = raw !== "" && !Number.isNaN(n);
                  const pct = ok && gbExam ? (n / gbExam.total_marks) * 100 : null;
                  return (
                    <tr key={r.student.id}>
                      <td className="py-2.5 pl-4 pr-3">
                        <div className="font-medium text-soil">{r.student.full_name}</div>
                        <div className="text-xs text-soil/60">{r.student.student_no}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min={0}
                          max={gbExam?.total_marks ?? 100}
                          step="0.5"
                          className={inputClass}
                          value={raw}
                          onChange={(ev) => setGbInputs((s) => ({ ...s, [r.student.id]: ev.target.value }))}
                          placeholder="—"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right text-soil/70">{pct != null ? `${pct.toFixed(0)}%` : "—"}</td>
                      <td className="py-2.5 pr-4 pl-3 text-right">
                        {pct != null ? (
                          <span className="rounded-md bg-fern px-2 py-0.5 text-xs font-semibold text-primary-foreground">{letterGrade(pct)}</span>
                        ) : (
                          <span className="text-xs text-soil/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {gbRoster.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-soil/60">No active students enrolled in this course.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button type="submit" disabled={gbSaving || gbRoster.length === 0} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {gbSaving ? "Saving…" : "Save grades"}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}
