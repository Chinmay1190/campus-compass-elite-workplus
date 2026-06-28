import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  CalendarCheck,
  GraduationCap,
  Wallet,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  useQuery,
  useRealtime,
  fetchMyStudent,
  fetchMyAttendance,
  fetchMyGrades,
  fetchMyFees,
  fetchMyLoans,
  fetchAnnouncements,
  fetchMyAttendanceByCourse,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/me")({
  head: () => ({ meta: [{ title: "My Dashboard — Verdant Academy" }] }),
  component: StudentDashboard,
});

function letter(pct: number) {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B+";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function StudentDashboard() {
  const { user } = useAuth();
  const { data: me } = useQuery(fetchMyStudent);
  const { data: att, refetch: rA } = useQuery(fetchMyAttendance);
  const { data: grades, refetch: rG } = useQuery(fetchMyGrades);
  const { data: fees, refetch: rF } = useQuery(fetchMyFees);
  const { data: loans, refetch: rL } = useQuery(fetchMyLoans);
  const { data: announcements } = useQuery(fetchAnnouncements);
  const { data: byCourse, refetch: rBC } = useQuery(fetchMyAttendanceByCourse);

  useRealtime("me-feed", ["attendance", "grades", "fees", "book_loans"], () => {
    rA(); rG(); rF(); rL(); rBC();
  });

  const totalAtt = (att ?? []).length;
  const present = (att ?? []).filter((a) => a.status === "present").length;
  const attRate = totalAtt ? Math.round((present / totalAtt) * 100) : 0;

  const gradesArr = (grades ?? []) as Array<{
    id: string;
    score: number;
    exam: { title: string; total_marks: number; exam_date: string; course: { code: string; title: string } | null } | null;
  }>;
  const avgPct = gradesArr.length
    ? Math.round(
        gradesArr.reduce((a, g) => a + (g.exam ? (Number(g.score) / g.exam.total_marks) * 100 : 0), 0) /
          gradesArr.length,
      )
    : 0;

  const outstanding = (fees ?? []).filter((f) => f.status !== "Paid").reduce((a, f) => a + Number(f.amount), 0);
  const activeLoans = (loans ?? []).filter((l) => !l.returned_on);

  const recentAnnouncements = (announcements ?? []).slice(0, 3);

  if (me === null) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl rounded-3xl border border-sprout/30 bg-glass p-10 text-center shadow-soft">
          <Sparkles className="mx-auto size-10 text-fern" />
          <h1 className="mt-4 font-display text-3xl text-soil">Welcome, {user?.email}</h1>
          <p className="mt-2 text-soil/70">
            Your student record hasn't been linked to your account yet. Ask the registrar to enroll you using the same email address — your dashboard will appear here automatically.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Student · {me?.student_no}</p>
          <h1 className="mt-1 font-display text-4xl text-soil">
            Welcome back, {me?.full_name?.split(" ")[0] ?? "Student"}
          </h1>
          <p className="mt-1 text-soil/70">
            {me?.course?.title ? `${me.course.code} — ${me.course.title}` : "No course assigned"} · Year {me?.year}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Attendance" value={`${attRate}%`} icon={CalendarCheck} accent="from-fern/15 to-success/10" />
        <Kpi label="Average score" value={`${avgPct}%`} sub={gradesArr.length ? `Grade ${letter(avgPct)}` : "No grades yet"} icon={Award} accent="from-sprout/30 to-fern/10" />
        <Kpi label="Outstanding fees" value={`$${outstanding.toLocaleString()}`} icon={Wallet} accent="from-warning/15 to-warning/5" />
        <Kpi label="Books on loan" value={activeLoans.length.toString()} icon={BookOpen} accent="from-fern/10 to-mist" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
              <Award className="size-5 text-fern" /> My grades
            </h2>
            <Link to="/exams" className="text-xs font-medium text-fern hover:underline">All →</Link>
          </div>
          <ul className="mt-4 space-y-2">
            {gradesArr.length === 0 && <li className="rounded-xl bg-mist/40 p-4 text-sm text-soil/60">No grades recorded yet.</li>}
            {gradesArr.slice(0, 8).map((g) => {
              const pct = g.exam ? Math.round((Number(g.score) / g.exam.total_marks) * 100) : 0;
              return (
                <li key={g.id} className="flex items-center justify-between gap-3 rounded-xl bg-mist/40 px-4 py-3 transition hover:bg-mist">
                  <div>
                    <div className="text-sm font-medium text-soil">{g.exam?.title ?? "Exam"}</div>
                    <div className="text-xs text-soil/60">
                      {g.exam?.course?.code} · {g.exam?.exam_date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-soil">{g.score} / {g.exam?.total_marks}</div>
                      <div className="text-xs text-soil/60">{pct}%</div>
                    </div>
                    <span className="rounded-md bg-fern px-2 py-1 text-xs font-semibold text-primary-foreground">{letter(pct)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
            <CalendarCheck className="size-5 text-fern" /> Recent attendance
          </h2>
          <ul className="mt-4 space-y-2">
            {(att ?? []).slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl bg-mist/40 px-4 py-2.5">
                <span className="text-sm text-soil">{new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                <StatusPill status={a.status} />
              </li>
            ))}
            {(att ?? []).length === 0 && <li className="rounded-xl bg-mist/40 p-4 text-sm text-soil/60">No attendance yet.</li>}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
            <Wallet className="size-5 text-fern" /> Fee statements
          </h2>
          <ul className="mt-4 space-y-2">
            {(fees ?? []).slice(0, 5).map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-xl bg-mist/40 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-soil">{f.term}</div>
                  <div className="text-xs text-soil/60">{f.invoice_no} · due {f.due_date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-soil">${Number(f.amount).toLocaleString()}</span>
                  <FeeBadge status={f.status} />
                </div>
              </li>
            ))}
            {(fees ?? []).length === 0 && <li className="rounded-xl bg-mist/40 p-4 text-sm text-soil/60">No invoices yet.</li>}
          </ul>
        </section>

        <section className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
            <GraduationCap className="size-5 text-fern" /> Latest announcements
          </h2>
          <ul className="mt-4 space-y-3">
            {recentAnnouncements.map((a) => (
              <li key={a.id} className="rounded-xl border-l-2 border-fern bg-mist/40 px-4 py-3">
                <div className="text-sm font-medium text-soil">{a.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-soil/70">{a.body}</p>
              </li>
            ))}
            {recentAnnouncements.length === 0 && <li className="rounded-xl bg-mist/40 p-4 text-sm text-soil/60">Nothing new.</li>}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
          <CalendarCheck className="size-5 text-fern" /> Attendance evidence timeline
        </h2>
        <p className="text-xs text-soil/60">Per-course present / late / absent history · updates in realtime</p>
        <div className="mt-5 space-y-5">
          {Object.entries(byCourse ?? {}).map(([cid, group]) => {
            const rows = group.rows.slice(0, 30);
            const tot = rows.length;
            const pres = rows.filter((r) => r.status === "present").length;
            const late = rows.filter((r) => r.status === "late").length;
            const abs = rows.filter((r) => r.status === "absent").length;
            const rate = tot ? Math.round((pres / tot) * 100) : 0;
            return (
              <div key={cid} className="rounded-xl border border-sprout/30 bg-mist/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-soil">{group.course ? `${group.course.code} — ${group.course.title}` : "Unassigned course"}</div>
                    <div className="text-xs text-soil/60">{tot} records · {pres} present · {late} late · {abs} absent</div>
                  </div>
                  <span className="rounded-full bg-fern/15 px-2.5 py-0.5 text-xs font-semibold text-fern">{rate}% present</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rows.length === 0 && <span className="text-xs text-soil/50">No attendance recorded yet.</span>}
                  {rows.map((r) => (
                    <span
                      key={r.id}
                      title={`${new Date(r.date).toLocaleDateString()} — ${r.status}`}
                      className={`inline-flex size-6 items-center justify-center rounded-md text-[10px] font-bold ${
                        r.status === "present"
                          ? "bg-success/20 text-success"
                          : r.status === "late"
                          ? "bg-warning/30 text-warning-foreground"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {r.status === "present" ? "P" : r.status === "late" ? "L" : "A"}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {Object.keys(byCourse ?? {}).length === 0 && (
            <div className="rounded-xl bg-mist/40 p-4 text-sm text-soil/60">No attendance recorded yet.</div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Kpi({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub?: string; icon: typeof TrendingUp; accent: string }) {
  return (
    <div className={`group rounded-2xl border border-sprout/30 bg-gradient-to-br ${accent} p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-soil/60">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-xl bg-glass text-fern">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-4 font-display text-3xl text-fern">{value}</div>
      {sub && <div className="mt-1 text-xs text-soil/60">{sub}</div>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    present: "bg-success/15 text-success",
    late: "bg-warning/20 text-warning-foreground",
    absent: "bg-destructive/10 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status]}`}>{status}</span>;
}

function FeeBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-success/15 text-success",
    Pending: "bg-warning/20 text-warning-foreground",
    Overdue: "bg-destructive/10 text-destructive",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-mist text-soil"}`}>{status}</span>;
}