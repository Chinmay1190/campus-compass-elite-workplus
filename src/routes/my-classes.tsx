import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Users,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Award,
} from "lucide-react";
import { useMemo } from "react";
import {
  useQuery,
  useRealtime,
  fetchMyTeacher,
  fetchTeacherCourses,
  fetchStudents,
  fetchExams,
  fetchAttendance,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/my-classes")({
  head: () => ({ meta: [{ title: "My Classes — Verdant Academy" }] }),
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { user } = useAuth();
  const { data: me } = useQuery(fetchMyTeacher);
  const { data: courses, refetch: rC } = useQuery(fetchTeacherCourses);
  const { data: students, refetch: rS } = useQuery(fetchStudents);
  const { data: exams, refetch: rE } = useQuery(fetchExams);
  const { data: attendance, refetch: rA } = useQuery(fetchAttendance);

  useRealtime("teacher-feed", ["courses", "students", "exams", "grades", "attendance"], () => {
    rC(); rS(); rE(); rA();
  });

  const myCourseIds = useMemo(() => new Set((courses ?? []).map((c) => c.id)), [courses]);
  const myStudents = (students ?? []).filter((s) => s.course_id && myCourseIds.has(s.course_id));

  const today = new Date().toISOString().slice(0, 10);
  const upcomingExams = (exams ?? [])
    .filter((e) => myCourseIds.has(e.course_id) && e.exam_date >= today)
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date));

  const myAttendance = (attendance ?? []).filter((a) => myCourseIds.has(a.course_id));
  const present = myAttendance.filter((a) => a.status === "present").length;
  const attRate = myAttendance.length ? Math.round((present / myAttendance.length) * 100) : 0;

  const pendingGrading = upcomingExams.length; // placeholder; we count exams without grades below
  const ungraded = (exams ?? []).filter((e) => myCourseIds.has(e.course_id) && (e.grades?.length ?? 0) === 0).length;

  if (me === null) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl rounded-3xl border border-sprout/30 bg-glass p-10 text-center shadow-soft">
          <Sparkles className="mx-auto size-10 text-fern" />
          <h1 className="mt-4 font-display text-3xl text-soil">Welcome, {user?.email}</h1>
          <p className="mt-2 text-soil/70">
            Your faculty record hasn't been linked to your account yet. Ask the admin to add you with the same email address.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">{me?.title} · {me?.staff_no}</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Welcome, {me?.full_name?.split(" ")[0] ?? "Faculty"}</h1>
          <p className="mt-1 text-soil/70">
            {courses?.length ?? 0} courses · {myStudents.length} students · {me?.department}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/attendance" className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90">
            <CalendarCheck className="size-4" /> Take attendance
          </Link>
          <Link to="/exams" className="inline-flex items-center gap-2 rounded-xl border border-sprout/40 bg-glass px-4 py-2 text-sm font-medium text-soil hover:text-fern">
            <ClipboardList className="size-4" /> Gradebook
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Courses" value={(courses?.length ?? 0).toString()} icon={GraduationCap} accent="from-fern/15 to-success/10" />
        <Stat label="Students" value={myStudents.length.toString()} icon={Users} accent="from-sprout/30 to-fern/10" />
        <Stat label="Attendance rate" value={`${attRate}%`} icon={CalendarCheck} accent="from-fern/10 to-mist" />
        <Stat label="Ungraded exams" value={ungraded.toString()} icon={Award} accent="from-warning/15 to-warning/5" sub={pendingGrading ? `${upcomingExams.length} upcoming` : undefined} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
            <GraduationCap className="size-5 text-fern" /> My courses
          </h2>
          <ul className="mt-4 space-y-2">
            {(courses ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl bg-mist/40 px-4 py-3 transition hover:bg-mist">
                <div>
                  <div className="text-sm font-semibold text-soil">{c.code} — {c.title}</div>
                  <div className="text-xs text-soil/60">{c.schedule ?? "Schedule TBA"} · {c.credits} credits</div>
                </div>
                <span className="rounded-full bg-fern/15 px-2.5 py-0.5 text-xs font-medium text-fern">{c.enrolled_count ?? 0} enrolled</span>
              </li>
            ))}
            {(courses ?? []).length === 0 && <li className="rounded-xl bg-mist/40 p-4 text-sm text-soil/60">No courses assigned yet.</li>}
          </ul>
        </section>

        <section className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
            <ClipboardList className="size-5 text-fern" /> Upcoming exams
          </h2>
          <ul className="mt-4 space-y-2">
            {upcomingExams.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-xl bg-mist/40 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-soil">{e.title}</div>
                  <div className="text-xs text-soil/60">{e.course?.code} · {e.start_time?.slice(0,5) ?? ""} {e.location ? `· ${e.location}` : ""}</div>
                </div>
                <span className="rounded-lg bg-fern px-2.5 py-1 text-xs font-medium text-primary-foreground">
                  {new Date(e.exam_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
            {upcomingExams.length === 0 && <li className="rounded-xl bg-mist/40 p-4 text-sm text-soil/60">Nothing scheduled.</li>}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon, accent, sub }: { label: string; value: string; icon: typeof Users; accent: string; sub?: string }) {
  return (
    <div className={`rounded-2xl border border-sprout/30 bg-gradient-to-br ${accent} p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg`}>
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