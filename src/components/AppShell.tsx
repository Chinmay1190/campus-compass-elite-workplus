import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  UserCog,
  BarChart3,
  Settings,
  Leaf,
  Search,
  Bell,
  BookOpen,
  Megaphone,
  ClipboardList,
  Calendar,
  LogOut,
  UserCircle,
  Home,
  Briefcase,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth, type AppRole } from "@/lib/auth";
import { LoadingScreen } from "@/components/LoadingScreen";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: AppRole[]; // who can see it
};

const ALL: AppRole[] = ["admin", "teacher", "student"];
const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
  { to: "/me", label: "My Dashboard", icon: Home, roles: ["student"] },
  { to: "/my-classes", label: "My Classes", icon: Briefcase, roles: ["teacher"] },
  { to: "/students", label: "Student Records", icon: Users, roles: ["admin", "teacher"] },
  { to: "/courses", label: "Course Catalog", icon: GraduationCap, roles: ALL },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, roles: ALL },
  { to: "/exams", label: "Exams & Grades", icon: ClipboardList, roles: ALL },
  { to: "/fees", label: "Financial Aid", icon: Wallet, roles: ["admin", "student"] },
  { to: "/teachers", label: "Faculty", icon: UserCog, roles: ["admin", "teacher"] },
  { to: "/library", label: "Library", icon: BookOpen, roles: ALL },
  { to: "/announcements", label: "Announcements", icon: Megaphone, roles: ALL },
  { to: "/calendar", label: "Calendar", icon: Calendar, roles: ALL },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "teacher"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, roles, isAuthenticated, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return <LoadingScreen label={loading ? "Authenticating" : "Redirecting"} />;
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "VA";
  const primaryRole = roles[0] ?? "guest";
  const visibleNav = nav.filter((n) => n.roles.some((r) => roles.includes(r)));

  return (
    <div className="flex min-h-dvh bg-mist text-soil">
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8 border-r border-sprout/30 bg-glass p-6">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-fern text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <div>
            <div className="text-base font-semibold leading-tight text-fern">
              Verdant Academy
            </div>
            <div className="text-xs text-soil/60">Student Management</div>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1">
          {visibleNav.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to as "/"}
                className={
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-fern text-primary-foreground shadow-soft"
                    : "text-soil/70 hover:bg-mist hover:text-fern")
                }
              >
                <Icon className="size-4" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-sprout/30 bg-mist p-4">
          <div className="text-xs font-semibold text-fern">Term 3 progress</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sprout/30">
            <div className="h-full w-2/3 rounded-full bg-fern" />
          </div>
          <div className="mt-2 text-[11px] text-soil/60">
            68% complete · 42 days remaining
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-sprout/30 bg-glass/80 px-6 py-4 backdrop-blur">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soil/50" />
            <input
              placeholder="Search students, courses, faculty…"
              className="w-full rounded-xl border border-sprout/40 bg-mist/60 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-soil/50 focus:border-fern focus:bg-glass"
            />
          </div>
          <button className="relative rounded-xl border border-sprout/40 bg-glass p-2 text-soil/70 hover:text-fern">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-fern" />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="hidden text-right sm:block">
                <div className="text-sm font-medium text-soil">
                  {user?.email}
                </div>
                <div className="text-xs capitalize text-soil/60">{primaryRole}</div>
              </Link>
              <Link
                to="/profile"
                className="flex size-9 items-center justify-center rounded-full bg-sprout/50 text-sm font-semibold text-fern"
              >
                {initials}
              </Link>
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/login" });
                }}
                className="rounded-xl border border-sprout/40 bg-glass p-2 text-soil/70 hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
            >
              <UserCircle className="size-4" /> Sign in
            </Link>
          )}
        </header>

        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
