import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ShieldCheck, ClipboardList, Award, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useRealtime, fetchAuditLogs, type AuditLog } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/audit")({
  head: () => ({ meta: [{ title: "Audit Log — Verdant Academy" }] }),
  component: AuditPage,
});

const actionStyles: Record<string, string> = {
  INSERT: "bg-success/15 text-success",
  UPDATE: "bg-warning/20 text-warning-foreground",
  DELETE: "bg-destructive/10 text-destructive",
};

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function AuditPage() {
  const { hasRole, loading } = useAuth();
  const [table, setTable] = useState<"all" | "attendance" | "grades">("all");
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("");
  const { data, refetch } = useQuery(() => fetchAuditLogs({ table, limit: 200 }), [table]);
  useRealtime("audit-feed", ["audit_logs"], () => { refetch(); });

  const allowed = hasRole("admin") || hasRole("teacher");
  if (!loading && !allowed) return <Navigate to="/" />;

  const logs = (data ?? []) as AuditLog[];
  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const al = actor.trim().toLowerCase();
    return logs.filter((l) => {
      if (ql && !(l.summary ?? "").toLowerCase().includes(ql)) return false;
      if (al && !(l.actor_email ?? "").toLowerCase().includes(al)) return false;
      return true;
    });
  }, [logs, q, actor]);

  const stats = useMemo(() => {
    const att = logs.filter((l) => l.table_name === "attendance").length;
    const grd = logs.filter((l) => l.table_name === "grades").length;
    const actors = new Set(logs.map((l) => l.actor_email).filter(Boolean));
    return { att, grd, actors: actors.size };
  }, [logs]);

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Compliance & accountability</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Audit Log</h1>
          <p className="mt-1 text-soil/70">Live trail of every attendance and grade change · updates in realtime</p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Attendance changes" value={stats.att} icon={ClipboardList} />
        <Stat label="Grade changes" value={stats.grd} icon={Award} />
        <Stat label="Distinct actors" value={stats.actors} icon={ShieldCheck} />
      </div>

      <div className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[12rem]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soil/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search summary (student, course, score)…"
              className="w-full rounded-xl border border-sprout/40 bg-mist/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-fern focus:bg-glass"
            />
          </div>
          <div className="relative">
            <input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="Filter by actor email"
              className="w-56 rounded-xl border border-sprout/40 bg-mist/60 px-3 py-2 text-sm outline-none focus:border-fern focus:bg-glass"
            />
          </div>
          <div className="inline-flex items-center gap-1 rounded-xl border border-sprout/40 bg-mist/60 p-1">
            {(["all", "attendance", "grades"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTable(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  table === t ? "bg-fern text-primary-foreground shadow-soft" : "text-soil/70 hover:text-fern"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-soil/60">
            <Filter className="size-3.5" /> {filtered.length} of {logs.length}
          </span>
        </div>

        <ul className="mt-5 divide-y divide-sprout/20">
          {filtered.map((l) => (
            <li key={l.id} className="flex flex-wrap items-start gap-3 py-3">
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${actionStyles[l.action] ?? "bg-mist text-soil"}`}>
                {l.action}
              </span>
              <span className="shrink-0 rounded-md bg-mist px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-soil/70">
                {l.table_name}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-soil">{l.summary ?? "—"}</div>
                <div className="mt-0.5 text-xs text-soil/60">
                  by <span className="font-medium text-soil/80">{l.actor_email ?? "system"}</span> · {timeAgo(l.created_at)} · {new Date(l.created_at).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-10 text-center text-sm text-soil/60">No matching audit entries.</li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof ShieldCheck }) {
  return (
    <div className="rounded-2xl border border-sprout/30 bg-glass p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm text-soil/60">{label}</span>
        <span className="flex size-8 items-center justify-center rounded-lg bg-fern/15 text-fern">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl text-fern">{value}</div>
    </div>
  );
}