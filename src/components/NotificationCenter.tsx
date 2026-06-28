import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  useQuery,
  useRealtime,
  fetchMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const typeStyles: Record<string, string> = {
  urgent: "bg-destructive/10 text-destructive border-destructive/30",
  important: "bg-warning/20 text-warning-foreground border-warning/40",
  attendance: "bg-fern/15 text-fern border-fern/30",
  grade: "bg-sprout/30 text-fern border-sprout/40",
  announcement: "bg-mist text-soil border-sprout/30",
  info: "bg-mist text-soil border-sprout/30",
};

export function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, refetch } = useQuery(fetchMyNotifications);
  useRealtime("notifications-center", ["notifications"], () => { refetch(); });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  const items = (data ?? []) as Notification[];
  const unread = useMemo(() => items.filter((n) => !n.read_at).length, [items]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl border border-sprout/40 bg-glass p-2 text-soil/70 transition hover:text-fern"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-sprout/30 bg-glass shadow-soft">
          <div className="flex items-center justify-between border-b border-sprout/30 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-soil">Notifications</div>
              <div className="text-xs text-soil/60">
                {unread === 0 ? "All caught up" : `${unread} unread`}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={async () => { await markAllNotificationsRead(); refetch(); }}
                  title="Mark all read"
                  className="rounded-md p-1.5 text-soil/60 hover:bg-mist hover:text-fern"
                >
                  <CheckCheck className="size-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5 text-soil/60 hover:bg-mist">
                <X className="size-4" />
              </button>
            </div>
          </div>

          <ul className="max-h-[28rem] divide-y divide-sprout/20 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-soil/60">
                <Bell className="mx-auto mb-2 size-6 text-soil/30" />
                No notifications yet.
              </li>
            )}
            {items.map((n) => {
              const cls = typeStyles[n.type ?? "info"] ?? typeStyles.info;
              return (
                <li key={n.id} className={`group relative px-4 py-3 transition ${n.read_at ? "" : "bg-fern/5"}`}>
                  {n.link ? (
                    <Link to={n.link as "/"} onClick={() => setOpen(false)} className="block pr-12">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 inline-flex shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
                        {n.type ?? "info"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-soil">{n.title}</div>
                        {n.body && <div className="mt-0.5 line-clamp-2 text-xs text-soil/70">{n.body}</div>}
                        <div className="mt-1 text-[10px] uppercase tracking-wider text-soil/40">{timeAgo(n.created_at)}</div>
                      </div>
                    </div>
                    </Link>
                  ) : (
                    <div className="block pr-12">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 inline-flex shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
                          {n.type ?? "info"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-soil">{n.title}</div>
                          {n.body && <div className="mt-0.5 line-clamp-2 text-xs text-soil/70">{n.body}</div>}
                          <div className="mt-1 text-[10px] uppercase tracking-wider text-soil/40">{timeAgo(n.created_at)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute right-2 top-3 flex gap-0.5">
                    {!n.read_at && (
                      <button
                        title="Mark read"
                        onClick={async (e) => { e.stopPropagation(); await markNotificationRead(n.id); refetch(); }}
                        className="rounded-md p-1 text-soil/50 hover:bg-mist hover:text-fern"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                    <button
                      title="Delete"
                      onClick={async (e) => { e.stopPropagation(); await deleteNotification(n.id); refetch(); }}
                      className="rounded-md p-1 text-soil/50 hover:bg-mist hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}