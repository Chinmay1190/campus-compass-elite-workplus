import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportColumn<T> = {
  header: string;
  /** Cell value accessor. Return string/number/null. */
  accessor: (row: T) => string | number | null | undefined;
};

const BRAND = {
  name: "Verdant Academy",
  tagline: "Student Management System",
  primary: [21, 71, 52] as [number, number, number], // emerald
  gold: [193, 142, 53] as [number, number, number],
  ink: [40, 42, 38] as [number, number, number],
};

const csvCell = (v: unknown) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function exportCsv<T>(filename: string, columns: ExportColumn<T>[], rows: T[]) {
  const lines = [
    columns.map((c) => csvCell(c.header)).join(","),
    ...rows.map((r) => columns.map((c) => csvCell(c.accessor(r))).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export type PdfOptions = {
  /** Document title shown in header. */
  title: string;
  /** Optional subtitle, e.g. filter description. */
  subtitle?: string;
  /** Orientation. Defaults to portrait. */
  orientation?: "portrait" | "landscape";
};

export function exportPdf<T>(
  filename: string,
  columns: ExportColumn<T>[],
  rows: T[],
  options: PdfOptions,
) {
  const doc = new jsPDF({
    orientation: options.orientation ?? "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Header band
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageW, 78, "F");
  doc.setFillColor(...BRAND.gold);
  doc.rect(0, 78, pageW, 3, "F");

  // Brand logo mark
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(36, 22, 36, 36, 6, 6, "F");
  doc.setTextColor(...BRAND.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("V", 54, 47, { align: "center" });

  // Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(BRAND.name, 84, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 200);
  doc.text(BRAND.tagline.toUpperCase(), 84, 55, { charSpace: 1.5 });

  // Generated date (top right)
  const now = new Date();
  const stamp = now.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 210);
  doc.text(stamp, pageW - 36, 40, { align: "right" });
  doc.setTextColor(193, 142, 53);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("OFFICIAL REPORT", pageW - 36, 55, { align: "right", charSpace: 1.2 });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.ink);
  doc.text(options.title, 36, 118);
  if (options.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 100);
    doc.text(options.subtitle, 36, 135);
  }
  // Summary chip
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.primary);
  doc.text(`${rows.length} record${rows.length === 1 ? "" : "s"}`, pageW - 36, 118, { align: "right" });

  // Table
  autoTable(doc, {
    startY: options.subtitle ? 152 : 138,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) =>
      columns.map((c) => {
        const v = c.accessor(r);
        return v === null || v === undefined ? "—" : String(v);
      }),
    ),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      textColor: [40, 42, 38],
      lineColor: [228, 224, 210],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: BRAND.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    alternateRowStyles: { fillColor: [248, 246, 238] },
    margin: { left: 36, right: 36 },
    didDrawPage: () => {
      // Footer
      const ph = doc.internal.pageSize.getHeight();
      const pw = doc.internal.pageSize.getWidth();
      doc.setDrawColor(228, 224, 210);
      doc.setLineWidth(0.5);
      doc.line(36, ph - 36, pw - 36, ph - 36);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 130);
      doc.text(`${BRAND.name} • Confidential`, 36, ph - 22);
      const pageNo = doc.getNumberOfPages();
      doc.text(`Page ${pageNo}`, pw - 36, ph - 22, { align: "right" });
    },
  });

  // Empty state
  if (rows.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(140, 140, 130);
    doc.text("No records to display.", pageW / 2, pageH / 2, { align: "center" });
  }

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
