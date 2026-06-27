import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CalendarCheck, X, Clock, ClipboardList, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import {
  useQuery,
  useRealtime,
  fetchStudents,
  fetchCourses,
  fetchAttendance,
  markAttendance,
  markAttendanceBulk,
  type Student,
  type AttendanceRow,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

type AttRow = { student: string; student_no: string; course: string } & Record<string, string>;

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance Logs — Verdant Academy" },
      { name: "description", content: "Daily attendance tracking and analytics." },
    ],
  }),
  component: AttendancePage,
});

type Status = "present" | "late" | "absent";
const cycle: Record<Status, Status> = { present: "late", late: "absent", absent: "present" };

function lastWeekdays(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  while (out.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.unshift(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

function AttendancePage() {
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin") || hasRole("teacher");
  const { data: students } = useQuery(fetchStudents);
  const { data: courses } = useQuery(fetchCourses);
  const { data: records, refetch } = useQuery(fetchAttendance);
  useRealtime("attendance-feed", ["attendance"], () => { refetch(); });

  const dates = useMemo(() => lastWeekdays(5), []);
  const roster = useMemo(
    () => (students ?? []).filter((s: Student) => s.course_id && s.status === "Active").slice(0, 10),
    [students],
  );

  const lookup = useMemo(() => {
    const map = new Map<string, Status>();
    (records ?? []).forEach((r: AttendanceRow) => map.set(`${r.student_id}|${r.date}`, r.status));
    return map;
  }, [records]);

  const totals = { present: 0, late: 0, absent: 0 };
  roster.forEach((s) =>
    dates.forEach((d) => {
      const st = lookup.get(`${s.id}|${d}`);
      if (st) totals[st] += 1;
    }),
  );

  const handleClick = async (s: Student, date: string) => {
    if (!canEdit || !s.course_id) return;
    const current = lookup.get(`${s.id}|${date}`) ?? "absent";
    const next = cycle[current];
    try {
      await markAttendance(s.id, s.course_id, date, next);
      await refetch();
    } catch (e) {
      toast.error("Could not update attendance: " + String(e));
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

  /* ---- Take-attendance modal ---- */
  const [takeOpen, setTakeOpen] = useState(false);
  const [takeCourse, setTakeCourse] = useState<string>("");
  const [takeDate, setTakeDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [saving, setSaving] = useState(false);

  const courseRoster = useMemo(
    () => (students ?? []).filter((s) => s.course_id === takeCourse && s.status === "Active"),
    [students, takeCourse],
  );

  const openTake = () => {
    setTakeCourse(courses?.[0]?.id ?? "");
    setTakeDate(new Date().toISOString().slice(0, 10));
    setMarks({});
    setTakeOpen(true);
  };

  const setMark = (sid: string, st: Status) => setMarks((m) => ({ ...m, [sid]: st }));
  const markAll = (st: Status) =>
    setMarks(() => Object.fromEntries(courseRoster.map((s) => [s.id, st])));

  const submitTake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!takeCourse || !takeDate || courseRoster.length === 0) return;
    setSaving(true);
    try {
      // Default unmarked students to "absent"
      const payload = courseRoster.map((s) => ({
        student_id: s.id,
        course_id: takeCourse,
        date: takeDate,
        status: (marks[s.id] ?? "absent") as Status,
      }));
      await markAttendanceBulk(payload);
      toast.success(`Attendance saved for ${payload.length} student${payload.length === 1 ? "" : "s"}`);
      setTakeOpen(false);
      await refetch();
    } catch (err) {
      toast.error("Could not save attendance: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const attRows: AttRow[] = useMemo(() => {
    return roster.map((s) => {
      const row: AttRow = { student: s.full_name, student_no: s.student_no, course: s.course?.code ?? "" };
      dates.forEach((d) => {
        row[d] = lookup.get(`${s.id}|${d}`) ?? "—";
      });
      return row;
    });
  }, [roster, dates, lookup]);

  const attCols: ExportColumn<AttRow>[] = [
    { header: "Student No", accessor: (r) => r.student_no },
    { header: "Student", accessor: (r) => r.student },
    { header: "Course", accessor: (r) => r.course },
    ...dates.map((d) => ({ header: fmt(d), accessor: (r: AttRow) => r[d] })),
  ];

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">This week</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Attendance Logs</h1>
          <p className="mt-1 text-soil/70">
            {roster.length} students tracked{canEdit ? " · tap a cell to update" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              onClick={openTake}
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Plus className="size-4" /> Take attendance
            </button>
          )}
        <ExportMenu
          filename="attendance"
          title="Attendance Report"
          subtitle={`${dates[0]} → ${dates[dates.length - 1]} · ${roster.length} students · Present ${totals.present} · Late ${totals.late} · Absent ${totals.absent}`}
          columns={attCols}
          rows={attRows}
          orientation="landscape"
        />
        </div>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Present", value: totals.present, color: "text-success", bg: "bg-success/15", icon: CalendarCheck },
          { label: "Late", value: totals.late, color: "text-warning-foreground", bg: "bg-warning/20", icon: Clock },
          { label: "Absent", value: totals.absent, color: "text-destructive", bg: "bg-destructive/10", icon: X },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-sprout/30 bg-glass p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-soil/60">{s.label}</span>
              <span className={`flex size-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                <s.icon className="size-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-3xl text-fern">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-soil">Weekly grid</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sprout/30 text-left text-xs uppercase tracking-wider text-soil/60">
                <th className="py-3 pr-4 font-medium">Student</th>
                {dates.map((d) => (
                  <th key={d} className="px-2 py-3 text-center font-medium">{fmt(d)}</th>
                ))}
                <th className="py-3 pl-4 text-right font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sprout/20">
              {roster.map((s) => {
                const row = dates.map((d) => lookup.get(`${s.id}|${d}`));
                const marked = row.filter(Boolean) as Status[];
                const present = marked.filter((x) => x === "present").length;
                const rate = marked.length ? Math.round((present / marked.length) * 100) : 0;
                return (
                  <tr key={s.id}>
                    <td className="py-3.5 pr-4">
                      <div className="font-medium text-soil">{s.full_name}</div>
                      <div className="text-xs text-soil/60">{s.student_no}</div>
                    </td>
                    {dates.map((d, i) => (
                      <td key={i} className="px-2 py-3.5 text-center">
                        <button
                          onClick={() => handleClick(s, d)}
                          disabled={!canEdit}
                          className={canEdit ? "cursor-pointer" : "cursor-default"}
                        >
                          <Cell status={row[i]} />
                        </button>
                      </td>
                    ))}
                    <td className="py-3.5 pl-4 text-right font-semibold text-fern">{rate}%</td>
                  </tr>
                );
              })}
              {students && roster.length === 0 && (
                <tr>
                  <td colSpan={dates.length + 2} className="py-10 text-center text-sm text-soil/60">
                    No active enrolled students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal size="xl" open={takeOpen} onClose={() => setTakeOpen(false)} title="Take attendance">
        <form onSubmit={submitTake} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Course">
              <select required className={inputClass} value={takeCourse} onChange={(e) => { setTakeCourse(e.target.value); setMarks({}); }}>
                <option value="">Select course…</option>
                {(courses ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input required type="date" max={new Date().toISOString().slice(0,10)} className={inputClass} value={takeDate} onChange={(e) => setTakeDate(e.target.value)} />
            </Field>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-mist/60 px-3 py-2 text-xs">
            <span className="text-soil/70">
              {courseRoster.length} active student{courseRoster.length === 1 ? "" : "s"} ·
              unmarked will be saved as <strong className="text-destructive">Absent</strong>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-soil/60">Mark all:</span>
              <button type="button" onClick={() => markAll("present")} className="rounded-md bg-success/15 px-2 py-1 text-success">Present</button>
              <button type="button" onClick={() => markAll("late")} className="rounded-md bg-warning/20 px-2 py-1 text-warning-foreground">Late</button>
              <button type="button" onClick={() => markAll("absent")} className="rounded-md bg-destructive/10 px-2 py-1 text-destructive">Absent</button>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-sprout/30">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-mist/80 text-left text-xs uppercase tracking-wider text-soil/60">
                <tr>
                  <th className="py-2 pl-4 pr-3">Student</th>
                  <th className="py-2 px-3 text-center">Present</th>
                  <th className="py-2 px-3 text-center">Late</th>
                  <th className="py-2 px-3 text-center">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sprout/20">
                {courseRoster.map((s) => {
                  const cur = marks[s.id];
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 pl-4 pr-3">
                        <div className="font-medium text-soil">{s.full_name}</div>
                        <div className="text-xs text-soil/60">{s.student_no}</div>
                      </td>
                      {(["present", "late", "absent"] as Status[]).map((opt) => (
                        <td key={opt} className="px-3 py-2.5 text-center">
                          <input
                            type="radio"
                            name={`att-${s.id}`}
                            checked={cur === opt}
                            onChange={() => setMark(s.id, opt)}
                            className="size-4 accent-fern"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {courseRoster.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-sm text-soil/60">No active students in this course.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            disabled={saving || courseRoster.length === 0}
            className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50"
          >
            <ClipboardList className="inline size-4 mr-1" />
            {saving ? "Saving…" : `Save attendance (${courseRoster.length})`}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}

function Cell({ status }: { status?: Status }) {
  if (status === "present")
    return <span className="inline-flex size-7 items-center justify-center rounded-lg bg-success/15 text-success">●</span>;
  if (status === "late")
    return <span className="inline-flex size-7 items-center justify-center rounded-lg bg-warning/20 text-warning-foreground">◐</span>;
  if (status === "absent")
    return <span className="inline-flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">✕</span>;
  return <span className="inline-flex size-7 items-center justify-center rounded-lg bg-mist text-soil/30">·</span>;
}
