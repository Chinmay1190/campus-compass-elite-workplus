import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { exportCsv, exportPdf, type ExportColumn } from "@/lib/export";
import { toast } from "sonner";

type Props<T> = {
  filename: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn<T>[];
  rows: T[] | null | undefined;
  orientation?: "portrait" | "landscape";
  /** Optional label override for the button. */
  label?: string;
};

export function ExportMenu<T>({
  filename,
  title,
  subtitle,
  columns,
  rows,
  orientation,
  label = "Export",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const safeRows = rows ?? [];
  const guard = () => {
    if (safeRows.length === 0) {
      toast.message("Nothing to export yet.");
      return false;
    }
    return true;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-sprout/40 bg-glass px-3 py-2 text-sm text-soil/80 shadow-soft transition-colors hover:border-fern/40 hover:text-fern"
      >
        <Download className="size-4" />
        {label}
        <ChevronDown className={"size-3.5 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-sprout/40 bg-glass p-1.5 shadow-elevated backdrop-blur">
          <button
            type="button"
            onClick={() => {
              if (!guard()) return;
              exportCsv(filename, columns, safeRows);
              setOpen(false);
              toast.success("CSV downloaded");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-soil/85 hover:bg-mist/70 hover:text-fern"
          >
            <FileSpreadsheet className="size-4 text-fern" />
            <div className="flex-1">
              <div className="font-medium">CSV spreadsheet</div>
              <div className="text-[11px] text-soil/55">Open in Excel / Sheets</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!guard()) return;
              exportPdf(filename, columns, safeRows, { title, subtitle, orientation });
              setOpen(false);
              toast.success("PDF downloaded");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-soil/85 hover:bg-mist/70 hover:text-fern"
          >
            <FileText className="size-4 text-gold" />
            <div className="flex-1">
              <div className="font-medium">Branded PDF</div>
              <div className="text-[11px] text-soil/55">Print-ready report</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
