import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CalendarCheck, X, Clock } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  useQuery,
  fetchStudents,
  fetchAttendance,
  markAttendance,
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
  const { data: records, refetch } = useQuery(fetchAttendance);

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
        <ExportMenu
          filename="attendance"
          title="Attendance Report"
          subtitle={`${dates[0]} → ${dates[dates.length - 1]} · ${roster.length} students · Present ${totals.present} · Late ${totals.late} · Absent ${totals.absent}`}
          columns={attCols}
          rows={attRows}
          orientation="landscape"
        />
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
