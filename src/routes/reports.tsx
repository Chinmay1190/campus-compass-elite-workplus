import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Download } from "lucide-react";
import { useQuery, fetchCourses, fetchStudents, fetchAttendance } from "@/lib/api";
import { exportAnalyticsPdf } from "@/lib/export";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [{ title: "Reports — Verdant Academy" }],
  }),
  component: ReportsPage,
});

const monthlyEnrollment = [
  { month: "Apr", value: 84 }, { month: "May", value: 92 }, { month: "Jun", value: 76 },
  { month: "Jul", value: 110 }, { month: "Aug", value: 168 }, { month: "Sep", value: 240 },
  { month: "Oct", value: 198 }, { month: "Nov", value: 162 },
];

function ReportsPage() {
  const { data: courses } = useQuery(fetchCourses);
  const { data: students } = useQuery(fetchStudents);
  const { data: attendance } = useQuery(fetchAttendance);
  const max = Math.max(...monthlyEnrollment.map((m) => m.value));

  const byDept = (courses ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.department] = (acc[c.department] ?? 0) + (c.enrolled_count ?? 0);
    return acc;
  }, {});
  const deptTotal = Object.values(byDept).reduce((a, b) => a + b, 0) || 1;

  const gpaList = (students ?? []).filter((s) => Number(s.gpa) > 0).map((s) => Number(s.gpa));
  const avgGpa = gpaList.length ? gpaList.reduce((a, b) => a + b, 0) / gpaList.length : 0;

  const fillRate = courses && courses.length
    ? Math.round(
        (courses.reduce((a, c) => a + (c.enrolled_count ?? 0) / c.capacity, 0) /
          courses.length) *
          100,
      )
    : 0;

  const attendanceRate = (() => {
    const rows = attendance ?? [];
    if (!rows.length) return 0;
    const present = rows.filter((r) => r.status === "present").length;
    return Math.round((present / rows.length) * 100);
  })();

  const handleExport = () => {
    try {
      exportAnalyticsPdf({
        filename: "analytics-report",
        title: "Term Analytics Report",
        subtitle: `Generated ${new Date().toLocaleDateString()} · ${students?.length ?? 0} students · ${courses?.length ?? 0} courses`,
        kpis: [
          { label: "Avg GPA", value: avgGpa.toFixed(2) },
          { label: "Fill rate", value: `${fillRate}%` },
          { label: "Attendance", value: `${attendanceRate}%` },
          { label: "Active students", value: String(students?.filter((s) => s.status === "Active").length ?? 0) },
        ],
        trend: {
          title: "Enrollment trend · last 8 months",
          bars: monthlyEnrollment.map((m) => ({ label: m.month, value: m.value })),
        },
        distribution: {
          title: "Enrollment by department",
          rows: Object.entries(byDept).map(([dept, count]) => ({ label: dept, count })),
        },
      });
      toast.success("Report downloaded");
    } catch (e) {
      toast.error("Could not export: " + String(e));
    }
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Analytics</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Reports</h1>
          <p className="mt-1 text-soil/70">Term-over-term performance and enrollment trends.</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border border-sprout/40 bg-glass px-3 py-2 text-sm text-soil/80 hover:text-fern">
          <Download className="size-4" /> Export PDF
        </button>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Avg GPA (active)" value={avgGpa.toFixed(2)} />
        <Kpi label="Course fill rate" value={`${fillRate}%`} />
        <Kpi label="Attendance rate" value={`${attendanceRate}%`} />
        <Kpi label="Retention" value="92.4%" />
      </div>

      <section className="mt-8 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-soil">Enrollment trend</h2>
        <p className="text-xs text-soil/60">Monthly · last 8 months</p>
        <div className="mt-8 flex h-64 items-end gap-3">
          {monthlyEnrollment.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-fern to-sprout"
                style={{ height: `${(m.value / max) * 100}%` }}
              />
              <span className="text-xs font-medium text-soil/70">{m.value}</span>
              <span className="text-[10px] text-soil/50">{m.month}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-soil">Enrollment by department</h2>
        <ul className="mt-5 space-y-4">
          {Object.entries(byDept).map(([dept, count]) => {
            const pct = Math.round((count / deptTotal) * 100);
            return (
              <li key={dept}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-soil">{dept}</span>
                  <span className="text-soil/70">{count} students · {pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-sprout/30">
                  <div className="h-full rounded-full bg-fern" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
      <div className="text-sm text-soil/60">{label}</div>
      <div className="mt-3 font-display text-4xl text-fern">{value}</div>
    </div>
  );
}
