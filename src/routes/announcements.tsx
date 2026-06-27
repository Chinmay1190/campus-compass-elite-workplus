import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Megaphone, Plus, Users, GraduationCap, Shield, Globe, Trash2, Pencil, Pin } from "lucide-react";
import { useState } from "react";
import { useQuery, useRealtime, fetchAnnouncements, deleteAnnouncement, updateAnnouncement, createAnnouncement, type Announcement } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [{ title: "Announcements — Verdant Academy" }],
  }),
  component: AnnouncementsPage,
});

const audienceIcon: Record<string, typeof Globe> = {
  all: Globe,
  students: GraduationCap,
  teachers: Users,
  admin: Shield,
};

function AnnouncementsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const { data: announcements, refetch } = useQuery(fetchAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [pinned, setPinned] = useState(false);
  const [expires_at, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setAudience("all");
    setPriority("normal");
    setPinned(false);
    setExpiresAt("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setBody(a.body);
    setAudience(a.audience);
    setPriority(a.priority ?? "normal");
    setPinned(!!a.pinned);
    setExpiresAt(a.expires_at ?? "");
    setShowForm(true);
  };

  const annCols: ExportColumn<Announcement>[] = [
    { header: "Date", accessor: (a) => new Date(a.created_at).toLocaleDateString() },
    { header: "Audience", accessor: (a) => a.audience },
    { header: "Title", accessor: (a) => a.title },
    { header: "Message", accessor: (a) => a.body },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title,
        body,
        audience,
        priority,
        pinned,
        expires_at: expires_at || null,
      };
      if (editingId) {
        await updateAnnouncement(editingId, payload);
        toast.success("Announcement updated");
      } else {
        await createAnnouncement(payload);
        toast.success("Announcement posted");
      }
      resetForm();
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const sorted = (announcements ?? [])
    .slice()
    .sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.created_at.localeCompare(a.created_at);
    });

  const priorityStyles: Record<string, string> = {
    normal: "bg-mist text-soil/70",
    important: "bg-warning/20 text-warning-foreground",
    urgent: "bg-destructive/15 text-destructive",
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Bulletin</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Announcements</h1>
          <p className="mt-1 text-soil/70">{announcements?.length ?? 0} posts · campus-wide updates</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu
            filename="announcements"
            title="Announcements"
            subtitle={`${announcements?.length ?? 0} posts`}
            columns={annCols}
            rows={announcements}
          />
          {isAdmin && (
            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  resetForm();
                } else {
                  openCreate();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Plus className="size-4" /> {showForm ? "Cancel" : "New post"}
            </button>
          )}
        </div>
      </header>

      {showForm && (
        <form onSubmit={submit} className="mb-8 space-y-4 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <div className="text-xs font-medium uppercase tracking-wider text-fern">
            {editingId ? "Editing post" : "New post"}
          </div>
          <div>
            <label className="text-xs font-medium text-soil/70">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/60 px-3 py-2 text-sm outline-none focus:border-fern"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-soil/70">Message</label>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={1000}
              className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/60 px-3 py-2 text-sm outline-none focus:border-fern"
            />
            <div className="mt-1 text-right text-[10px] text-soil/50">{body.length}/1000</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-soil/70">Audience</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/60 px-3 py-2 text-sm outline-none focus:border-fern">
                <option value="all">Everyone</option>
                <option value="students">Students</option>
                <option value="teachers">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-soil/70">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/60 px-3 py-2 text-sm outline-none focus:border-fern">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-soil/70">Expires on</label>
              <input type="date" value={expires_at} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1.5 w-full rounded-xl border border-sprout/40 bg-mist/60 px-3 py-2 text-sm outline-none focus:border-fern" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-soil/80">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded border-sprout/50 text-fern focus:ring-fern" />
            Pin to top of feed
          </label>
          <div className="flex justify-end">
            <button
              disabled={busy}
              className="rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft disabled:opacity-60"
            >
              {busy ? "Saving…" : editingId ? "Save changes" : "Post announcement"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sorted.map((a) => {
          const Icon = audienceIcon[a.audience] ?? Megaphone;
          return (
            <article key={a.id} className={`rounded-2xl border bg-glass p-6 shadow-soft ${a.priority === "urgent" ? "border-destructive/40" : a.priority === "important" ? "border-warning/50" : "border-sprout/30"}`}>
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sprout/30 text-fern">
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-soil">{a.title}</h3>
                    {a.pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-fern/10 px-2 py-0.5 text-[10px] font-medium text-fern">
                        <Pin className="size-3" /> Pinned
                      </span>
                    )}
                    {a.priority && a.priority !== "normal" && (
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${priorityStyles[a.priority]}`}>
                        {a.priority}
                      </span>
                    )}
                    <span className="rounded-full bg-mist px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-fern">
                      {a.audience}
                    </span>
                    {isAdmin && (
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="rounded-lg p-1.5 text-soil/50 hover:bg-fern/10 hover:text-fern"
                          aria-label="Edit announcement"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this announcement?")) return;
                            try {
                              await deleteAnnouncement(a.id);
                              toast.success("Deleted");
                              refetch();
                            } catch (err) {
                              toast.error(String(err));
                            }
                          }}
                          className="rounded-lg p-1.5 text-soil/50 hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete announcement"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-soil/80">{a.body}</p>
                  <p className="mt-3 text-xs text-soil/60">
                    {new Date(a.created_at).toLocaleString()}
                    {a.expires_at ? ` · expires ${a.expires_at}` : ""}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
        {!announcements && <div className="text-sm text-soil/50">Loading…</div>}
      </div>
    </AppShell>
  );
}
