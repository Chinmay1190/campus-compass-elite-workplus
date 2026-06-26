import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Users,
  CalendarCheck,
  Wallet,
  GraduationCap,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Megaphone,
} from "lucide-react";
import { useQuery, fetchStudents, fetchCourses, fetchFees, fetchAnnouncements } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Verdant Academy" },
      { name: "description", content: "Overview of enrollment, attendance, fees and upcoming classes." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: students } = useQuery(fetchStudents);
  const { data: courses } = useQuery(fetchCourses);
  const { data: fees } = useQuery(fetchFees);
  const { data: announcements } = useQuery(fetchAnnouncements);

  const totalStudents = students?.length ?? 0;
  const activeCourses = courses?.length ?? 0;
  const collected = (fees ?? []).filter((f) => f.status === "Paid").reduce((a, f) => a + Number(f.amount), 0);
  const activeRate = students && students.length
    ? Math.round((students.filter((s) => s.status === "Active").length / students.length) * 100)
    : 0;

  const stats = [
    { label: "Total Students", value: totalStudents.toLocaleString(), delta: "+4.8%", icon: Users },
    { label: "Active Rate", value: `${activeRate}%`, delta: "+1.2%", icon: CalendarCheck },
    { label: "Fees Collected", value: `$${collected.toLocaleString()}`, delta: "+12.4%", icon: Wallet },
    { label: "Active Courses", value: activeCourses.toString(), delta: "+3", icon: GraduationCap },
  ];

  const recent = (students ?? []).slice(0, 5);
  const recentAnnouncements = (announcements ?? []).slice(0, 3);

  return (
    <AppShell>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Term 3 · Fall 2024</p>
          <h1 className="mt-1 font-display text-4xl font-normal text-soil">
            Growth Dashboard
          </h1>
          <p className="mt-1 text-soil/70">
            Cultivating the development of our academic ecosystem.
          </p>
        </div>
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
        >
          <ArrowUpRight className="size-4" />
          View term report
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-soil/60">{label}</span>
              <span className="flex size-9 items-center justify-center rounded-xl bg-sprout/30 text-fern">
                <Icon className="size-4" />
              </span>
            </div>
            <div className="mt-4 font-display text-3xl text-fern">{value}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
              <TrendingUp className="size-3" />
              {delta} vs last term
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-soil">Recent enrollments</h2>
            <Link className="text-xs font-medium text-fern hover:underline" to="/students">
              View all →
            </Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-sprout/30">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left text-xs uppercase tracking-wider text-soil/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Enrolled</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sprout/30">
                {recent.map((s) => (
                  <tr key={s.id} className="hover:bg-mist/60">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-sprout/40 text-xs font-semibold text-fern">
                          {s.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium text-soil">{s.full_name}</div>
                          <div className="text-xs text-soil/60">{s.student_no}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-soil/80">{s.course?.title ?? "—"}</td>
                    <td className="px-4 py-3.5 text-soil/60">{s.enrolled_on}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
                {!students && (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-soil/50">Loading…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-soil">Latest news</h2>
            <Link to="/announcements" className="text-xs font-medium text-fern hover:underline">All →</Link>
          </div>
          <ul className="mt-5 space-y-4">
            {recentAnnouncements.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border-l-2 border-fern bg-mist/60 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-soil">{a.title}</span>
                  <Megaphone className="size-3.5 shrink-0 text-fern" />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-soil/70">{a.body}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-soil/60">
                  <Clock className="size-3" />
                  {new Date(a.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
            {!announcements && (
              <li className="text-sm text-soil/50">Loading…</li>
            )}
          </ul>
        </section>
      </div>
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
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-mist text-soil"}`}
    >
      {status}
    </span>
  );
}
