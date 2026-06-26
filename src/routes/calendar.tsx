import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, fetchExams, fetchFees } from "@/lib/api";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [{ title: "Academic Calendar — Verdant Academy" }],
  }),
  component: CalendarPage,
});

type Evt = { title: string; tone: string; date: string };

function CalendarPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const { data: exams } = useQuery(fetchExams);
  const { data: fees } = useQuery(fetchFees);
  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = cursor.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDay = (cursor.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();

  const events = useMemo(() => {
    const all: Evt[] = [];
    (exams ?? []).forEach((e) =>
      all.push({ title: `${e.course?.code ?? "Exam"} ${e.title}`, tone: "bg-warning/30 text-warning-foreground", date: e.exam_date }),
    );
    (fees ?? []).forEach((f) => {
      if (f.status !== "Paid")
        all.push({ title: `Due: ${f.invoice_no}`, tone: "bg-destructive/15 text-destructive", date: f.due_date });
    });
    return all;
  }, [exams, fees]);

  const eventsForDay = (d: number) => {
    const ymd = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.date === ymd);
  };

  const upcoming = useMemo(
    () =>
      [...events]
        .filter((e) => e.date >= today.toISOString().slice(0, 10))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6),
    [events, today],
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);


  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Schedule</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Academic Calendar</h1>
          <p className="mt-1 text-soil/70">Term events, exams and key dates.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-sprout/40 bg-glass p-1">
          <button
            onClick={() => setMonthOffset((m) => m - 1)}
            className="rounded-lg p-2 text-soil/70 hover:bg-mist hover:text-fern"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="px-3 text-sm font-medium text-soil">{monthName}</span>
          <button
            onClick={() => setMonthOffset((m) => m + 1)}
            className="rounded-lg p-2 text-soil/70 hover:bg-mist hover:text-fern"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wider text-soil/60">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {cells.map((d, i) => {
            const isToday =
              monthOffset === 0 && d === today.getDate();
            const dayEvents = d ? eventsForDay(d) : [];
            return (
              <div
                key={i}
                className={
                  "min-h-24 rounded-xl border p-2 text-left text-xs transition-colors " +
                  (d === null
                    ? "border-transparent"
                    : isToday
                      ? "border-fern bg-mist"
                      : "border-sprout/30 bg-mist/40 hover:bg-mist")
                }
              >
                {d && (
                  <>
                    <div
                      className={
                        "text-sm font-semibold " +
                        (isToday ? "text-fern" : "text-soil/80")
                      }
                    >
                      {d}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map((e, j) => (
                        <div
                          key={j}
                          className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium ${e.tone}`}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-soil">
          <CalendarIcon className="size-5 text-fern" /> Upcoming events
        </h2>
        <ol className="mt-5 space-y-4 border-l-2 border-sprout/40 pl-5">
          {upcoming.map((m, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-fern bg-glass" />
              <div className="text-xs font-semibold uppercase tracking-wider text-fern">
                {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-sm font-medium text-soil">{m.title}</div>
            </li>
          ))}
          {upcoming.length === 0 && <li className="text-sm text-soil/60">No upcoming events.</li>}
        </ol>
      </section>
    </AppShell>
  );
}
