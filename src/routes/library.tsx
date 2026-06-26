import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Plus, BookOpen, Search, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import {
  useQuery,
  fetchBooks,
  fetchStudents,
  fetchLoans,
  createBook,
  updateBook,
  deleteBook,
  lendBook,
  returnLoan,
  type Book,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [{ title: "Library — Verdant Academy" }],
  }),
  component: LibraryPage,
});

const emptyBookForm = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  total_copies: 1,
  publisher: "",
  year_published: new Date().getFullYear(),
  edition: "",
  shelf: "",
};

function LibraryPage() {
  const { data: books, refetch } = useQuery(fetchBooks);
  const { data: students } = useQuery(fetchStudents);
  const { data: loans, refetch: refetchLoans } = useQuery(fetchLoans);
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin");
  const [query, setQuery] = useState("");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [lendBookTarget, setLendBookTarget] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);

  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [lendForm, setLendForm] = useState({ student_id: "", due_date: "" });

  const filtered = useMemo(
    () =>
      (books ?? []).filter(
        (b) =>
          !query ||
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase()),
      ),
    [books, query],
  );

  const totalCopies = (books ?? []).reduce((a, b) => a + b.total_copies, 0);
  const available = (books ?? []).reduce((a, b) => a + b.available_copies, 0);
  const activeLoans = (loans ?? []).filter((l) => !l.returned_on);

  const bookCols: ExportColumn<Book>[] = [
    { header: "Title", accessor: (b) => b.title },
    { header: "Author", accessor: (b) => b.author },
    { header: "ISBN", accessor: (b) => b.isbn ?? "" },
    { header: "Category", accessor: (b) => b.category ?? "" },
    { header: "Available", accessor: (b) => `${b.available_copies} / ${b.total_copies}` },
  ];

  const openCreate = () => {
    setEditing(null);
    setBookForm(emptyBookForm);
    setBookModalOpen(true);
  };
  const openEdit = (b: Book) => {
    setEditing(b);
    setBookForm({
      title: b.title,
      author: b.author,
      isbn: b.isbn ?? "",
      category: b.category ?? "",
      total_copies: b.total_copies,
      publisher: b.publisher ?? "",
      year_published: b.year_published ?? new Date().getFullYear(),
      edition: b.edition ?? "",
      shelf: b.shelf ?? "",
    });
    setBookModalOpen(true);
  };

  const submitBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const onLoan = editing.total_copies - editing.available_copies;
        const newTotal = Number(bookForm.total_copies);
        await updateBook(editing.id, {
          title: bookForm.title,
          author: bookForm.author,
          isbn: bookForm.isbn || null,
          category: bookForm.category || null,
          total_copies: newTotal,
          available_copies: Math.max(0, newTotal - onLoan),
          publisher: bookForm.publisher || null,
          year_published: Number(bookForm.year_published) || null,
          edition: bookForm.edition || null,
          shelf: bookForm.shelf || null,
        });
        toast.success("Book updated");
      } else {
        await createBook({
          title: bookForm.title,
          author: bookForm.author,
          isbn: bookForm.isbn || null,
          category: bookForm.category || null,
          total_copies: Number(bookForm.total_copies),
          publisher: bookForm.publisher || null,
          year_published: Number(bookForm.year_published) || null,
          edition: bookForm.edition || null,
          shelf: bookForm.shelf || null,
        });
        toast.success("Book added");
      }
      setBookModalOpen(false);
      setEditing(null);
      setBookForm(emptyBookForm);
      await refetch();
    } catch (err) {
      toast.error("Could not save book: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b: Book) => {
    if (b.available_copies !== b.total_copies) {
      toast.error("Cannot delete: some copies are still on loan");
      return;
    }
    if (!confirm(`Delete "${b.title}"?`)) return;
    try {
      await deleteBook(b.id);
      toast.success("Book deleted");
      await refetch();
    } catch (err) {
      toast.error("Could not delete: " + String(err));
    }
  };

  const submitLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lendBookTarget || !lendForm.student_id || !lendForm.due_date) return;
    setSaving(true);
    try {
      await lendBook(lendBookTarget, lendForm.student_id, lendForm.due_date);
      toast.success("Book lent out");
      setLendBookTarget(null);
      setLendForm({ student_id: "", due_date: "" });
      await Promise.all([refetch(), refetchLoans()]);
    } catch (err) {
      toast.error("Could not lend book: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Collection</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Library</h1>
          <p className="mt-1 text-soil/70">
            {books?.length ?? 0} titles · {available}/{totalCopies} available · {activeLoans.length} on loan
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu
            filename="library-catalog"
            title="Library Catalog"
            subtitle={`${books?.length ?? 0} titles · ${available}/${totalCopies} available · ${activeLoans.length} on loan`}
            columns={bookCols}
            rows={books}
          />
          {canEdit && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90"
            >
              <Plus className="size-4" /> Add book
            </button>
          )}
        </div>
      </header>

      <div className="mb-6 rounded-2xl border border-sprout/30 bg-glass p-4 shadow-soft">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soil/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or author"
            className="w-full rounded-xl border border-sprout/40 bg-mist/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-fern focus:bg-glass"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <article key={b.id} className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-soil">{b.title}</h3>
                <p className="text-xs text-soil/60">by {b.author}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {canEdit && (
                  <>
                    <button onClick={() => openEdit(b)} aria-label="Edit" className="rounded-lg p-1.5 text-soil/60 hover:bg-fern/10 hover:text-fern">
                      <Pencil className="size-4" />
                    </button>
                    <button onClick={() => remove(b)} aria-label="Delete" className="rounded-lg p-1.5 text-soil/60 hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
                <span className="ml-1 flex size-10 items-center justify-center rounded-xl bg-sprout/30 text-fern">
                  <BookOpen className="size-5" />
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs">
              <span className="rounded-full bg-mist px-2.5 py-1 text-soil/70">{b.category ?? "General"}</span>
              <span className="text-soil/60">ISBN {b.isbn ?? "—"}</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-soil/70">
                <span className="font-semibold text-fern">{b.available_copies}</span> / {b.total_copies} available
              </div>
              {canEdit && (
                <button
                  disabled={b.available_copies === 0}
                  onClick={() => setLendBookTarget(b)}
                  className="rounded-lg bg-fern px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
                >
                  Lend
                </button>
              )}
            </div>
          </article>
        ))}
        {!books && <div className="text-sm text-soil/50">Loading…</div>}
      </div>

      {canEdit && activeLoans.length > 0 && (
        <section className="mt-8 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-soil">Active loans</h2>
          <div className="mt-4 divide-y divide-sprout/20">
            {activeLoans.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <div className="font-medium text-soil">{l.book?.title}</div>
                  <div className="text-xs text-soil/60">
                    {l.student?.full_name} · due {l.due_date}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await returnLoan(l);
                      toast.success("Marked returned");
                      await Promise.all([refetch(), refetchLoans()]);
                    } catch (err) {
                      toast.error("Could not return: " + String(err));
                    }
                  }}
                  className="rounded-lg border border-sprout/40 bg-glass px-3 py-1.5 text-xs font-medium text-soil/80 hover:text-fern"
                >
                  Mark returned
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal size="lg" open={bookModalOpen} onClose={() => { setBookModalOpen(false); setEditing(null); }} title={editing ? "Edit book" : "Add book to catalog"}>
        <form onSubmit={submitBook} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title">
              <input required className={inputClass} value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
            </Field>
            <Field label="Author">
              <input required className={inputClass} value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Publisher">
              <input className={inputClass} value={bookForm.publisher} onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} />
            </Field>
            <Field label="Year published">
              <input type="number" min={1500} max={new Date().getFullYear()} className={inputClass} value={bookForm.year_published} onChange={(e) => setBookForm({ ...bookForm, year_published: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISBN">
              <input className={inputClass} placeholder="978-3-16-148410-0" value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} />
            </Field>
            <Field label="Edition">
              <input className={inputClass} placeholder="3rd edition" value={bookForm.edition} onChange={(e) => setBookForm({ ...bookForm, edition: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className={inputClass} value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}>
                <option value="">General</option>
                <option>Fiction</option>
                <option>Reference</option>
                <option>Science</option>
                <option>Mathematics</option>
                <option>History</option>
                <option>Literature</option>
                <option>Biography</option>
                <option>Technology</option>
              </select>
            </Field>
            <Field label="Shelf location">
              <input className={inputClass} placeholder="A-12" value={bookForm.shelf} onChange={(e) => setBookForm({ ...bookForm, shelf: e.target.value })} />
            </Field>
          </div>
          <Field label="Total copies">
            <input type="number" min={1} className={inputClass} value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: Number(e.target.value) })} />
          </Field>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Add book"}
          </button>
        </form>
      </Modal>

      <Modal open={!!lendBookTarget} onClose={() => setLendBookTarget(null)} title={`Lend "${lendBookTarget?.title ?? ""}"`}>
        <form onSubmit={submitLend} className="space-y-4">
          <Field label="Student">
            <select required className={inputClass} value={lendForm.student_id} onChange={(e) => setLendForm({ ...lendForm, student_id: e.target.value })}>
              <option value="">Select a student…</option>
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.student_no})</option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <input required type="date" className={inputClass} value={lendForm.due_date} onChange={(e) => setLendForm({ ...lendForm, due_date: e.target.value })} />
          </Field>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : "Confirm loan"}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}
