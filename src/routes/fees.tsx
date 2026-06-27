import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Plus, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal, Field, inputClass } from "@/components/Modal";
import { useQuery, useRealtime, fetchFees, fetchStudents, createFee, updateFee, deleteFee, markFeePaid, type Fee } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ExportMenu } from "@/components/ExportMenu";
import type { ExportColumn } from "@/lib/export";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [{ title: "Financial Aid — Verdant Academy" }],
  }),
  component: FeesPage,
});

const emptyForm = { student_id: "", term: "Fall 2024", amount: 0, due_date: "", status: "Pending", method: "" };

function FeesPage() {
  const { data: fees, refetch } = useQuery(fetchFees);
  useRealtime("fees-feed", ["fees"], () => { refetch(); });
  const { data: students } = useQuery(fetchStudents);
  const { hasRole } = useAuth();
  const canEdit = hasRole("admin");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Fee | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const total = (fees ?? []).reduce((a, f) => a + Number(f.amount), 0);
  const paid = (fees ?? []).filter((f) => f.status === "Paid").reduce((a, f) => a + Number(f.amount), 0);
  const overdue = (fees ?? []).filter((f) => f.status === "Overdue").reduce((a, f) => a + Number(f.amount), 0);
  const pending = (fees ?? []).filter((f) => f.status === "Pending").reduce((a, f) => a + Number(f.amount), 0);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (f: Fee) => {
    setEditing(f);
    setForm({
      student_id: f.student_id,
      term: f.term,
      amount: Number(f.amount),
      due_date: f.due_date,
      status: f.status,
      method: f.method ?? "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) return;
    setSaving(true);
    try {
      if (editing) {
        await updateFee(editing.id, {
          term: form.term,
          amount: Number(form.amount),
          due_date: form.due_date,
          status: form.status as Fee["status"],
          method: form.method || null,
        });
        toast.success("Invoice updated");
      } else {
        await createFee({
          student_id: form.student_id,
          term: form.term,
          amount: Number(form.amount),
          due_date: form.due_date,
          status: form.status,
          method: form.method || null,
        });
        toast.success("Invoice created");
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await refetch();
    } catch (err) {
      toast.error("Could not save: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (f: Fee) => {
    if (!confirm(`Delete invoice ${f.invoice_no}?`)) return;
    try {
      await deleteFee(f.id);
      toast.success("Invoice deleted");
      await refetch();
    } catch (err) {
      toast.error("Could not delete: " + String(err));
    }
  };

  const markPaid = async (f: Fee) => {
    try {
      await markFeePaid(f, "Card");
      toast.success(`${f.invoice_no} marked paid`);
      await refetch();
    } catch (err) {
      toast.error("Could not update: " + String(err));
    }
  };

  const feeCols: ExportColumn<Fee>[] = [
    { header: "Invoice", accessor: (f) => f.invoice_no },
    { header: "Student", accessor: (f) => f.student?.full_name ?? "" },
    { header: "Student No", accessor: (f) => f.student?.student_no ?? "" },
    { header: "Term", accessor: (f) => f.term },
    { header: "Due", accessor: (f) => f.due_date },
    { header: "Method", accessor: (f) => f.method ?? "" },
    { header: "Amount", accessor: (f) => `$${Number(f.amount).toFixed(2)}` },
    { header: "Status", accessor: (f) => f.status },
  ];

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-soil/60">Fall 2024</p>
          <h1 className="mt-1 font-display text-4xl text-soil">Financial Aid & Fees</h1>
          <p className="mt-1 text-soil/70">{fees?.length ?? 0} invoices this term</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            filename="fees-statement"
            title="Fees Statement"
            subtitle={`Billed $${total.toFixed(2)} · Paid $${paid.toFixed(2)} · Pending $${pending.toFixed(2)} · Overdue $${overdue.toFixed(2)}`}
            columns={feeCols}
            rows={fees}
            orientation="landscape"
          />
          {canEdit && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-fern px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90">
              <Plus className="size-4" /> New invoice
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Billed" value={total} tone="text-soil" />
        <SummaryCard label="Collected" value={paid} tone="text-success" />
        <SummaryCard label="Pending" value={pending} tone="text-warning-foreground" />
        <SummaryCard label="Overdue" value={overdue} tone="text-destructive" />
      </div>

      <div className="mt-8 rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-soil">Invoices</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sprout/30 text-left text-xs uppercase tracking-wider text-soil/60">
                <th className="py-3 pr-4 font-medium">Invoice</th>
                <th className="py-3 pr-4 font-medium">Student</th>
                <th className="py-3 pr-4 font-medium">Term</th>
                <th className="py-3 pr-4 font-medium">Due</th>
                <th className="py-3 pr-4 font-medium">Method</th>
                <th className="py-3 pr-4 text-right font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                {canEdit && <th className="py-3 pr-4 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-sprout/20">
              {(fees ?? []).map((f) => (
                <tr key={f.id} className="hover:bg-mist/40">
                  <td className="py-3.5 pr-4 font-medium text-fern">{f.invoice_no}</td>
                  <td className="py-3.5 pr-4">
                    <div className="text-soil">{f.student?.full_name ?? "—"}</div>
                    <div className="text-xs text-soil/60">{f.student?.student_no ?? ""}</div>
                  </td>
                  <td className="py-3.5 pr-4 text-soil/80">{f.term}</td>
                  <td className="py-3.5 pr-4 text-soil/70">{f.due_date}</td>
                  <td className="py-3.5 pr-4 text-soil/70">{f.method ?? "—"}</td>
                  <td className="py-3.5 pr-4 text-right font-semibold text-soil">
                    ${Number(f.amount).toLocaleString()}
                  </td>
                  <td className="py-3.5 pr-4"><FeeBadge status={f.status} /></td>
                  {canEdit && (
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {f.status !== "Paid" && (
                          <button onClick={() => markPaid(f)} className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1 text-xs font-medium text-success hover:bg-success/25">
                            <CheckCircle2 className="size-3.5" /> Paid
                          </button>
                        )}
                        <button onClick={() => openEdit(f)} aria-label="Edit" className="rounded-lg p-1.5 text-soil/60 hover:bg-fern/10 hover:text-fern">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => remove(f)} aria-label="Delete" className="rounded-lg p-1.5 text-soil/60 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!fees && (
                <tr><td colSpan={canEdit ? 8 : 7} className="py-8 text-center text-sm text-soil/50">Loading…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Edit invoice" : "New invoice"}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Student">
            <select required disabled={!!editing} className={inputClass} value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
              <option value="">Select a student…</option>
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.student_no})</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Term">
              <input className={inputClass} value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} />
            </Field>
            <Field label="Amount ($)">
              <input type="number" min={0} className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Due date">
              <input required type="date" className={inputClass} value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Pending</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
            </Field>
          </div>
          <Field label="Method">
            <input className={inputClass} placeholder="Card, Bank, Cash…" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
          </Field>
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-fern px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Create invoice"}
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft">
      <div className="text-sm text-soil/60">{label}</div>
      <div className={`mt-3 font-display text-3xl ${tone}`}>${value.toLocaleString()}</div>
    </div>
  );
}

function FeeBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-success/15 text-success",
    Pending: "bg-warning/20 text-warning-foreground",
    Overdue: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  );
}
