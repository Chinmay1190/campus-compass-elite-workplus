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

/* ------------------------- Rich Analytics Report ------------------------- */

export type ReportKpi = { label: string; value: string };
export type ReportBar = { label: string; value: number };
export type ReportDistribution = { label: string; count: number };

export type AnalyticsReportOptions = {
  filename: string;
  title: string;
  subtitle?: string;
  kpis: ReportKpi[];
  trend: { title: string; bars: ReportBar[] };
  distribution: { title: string; rows: ReportDistribution[] };
};

export function exportAnalyticsPdf(opts: AnalyticsReportOptions) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Header band
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, pageW, 78, "F");
  doc.setFillColor(...BRAND.gold);
  doc.rect(0, 78, pageW, 3, "F");
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(36, 22, 36, 36, 6, 6, "F");
  doc.setTextColor(...BRAND.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("V", 54, 47, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(BRAND.name, 84, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 200);
  doc.text(BRAND.tagline.toUpperCase(), 84, 55, { charSpace: 1.5 });

  const now = new Date();
  const stamp = now.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 210);
  doc.text(stamp, pageW - 36, 40, { align: "right" });
  doc.setTextColor(193, 142, 53);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ANALYTICS REPORT", pageW - 36, 55, { align: "right", charSpace: 1.2 });

  // Title block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.ink);
  doc.text(opts.title, 36, 122);
  if (opts.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 100);
    doc.text(opts.subtitle, 36, 140);
  }

  // KPI cards
  let y = opts.subtitle ? 162 : 148;
  const cardW = (pageW - 72 - (opts.kpis.length - 1) * 10) / Math.max(1, opts.kpis.length);
  opts.kpis.forEach((k, i) => {
    const x = 36 + i * (cardW + 10);
    doc.setFillColor(248, 246, 238);
    doc.roundedRect(x, y, cardW, 70, 8, 8, "F");
    doc.setDrawColor(228, 224, 210);
    doc.roundedRect(x, y, cardW, 70, 8, 8, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 110);
    doc.text(k.label.toUpperCase(), x + 12, y + 18, { charSpace: 1.2 });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...BRAND.primary);
    doc.text(k.value, x + 12, y + 50);
  });
  y += 92;

  // Trend section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND.ink);
  doc.text(opts.trend.title, 36, y);
  y += 8;

  // Bar chart
  const chartX = 36;
  const chartY = y + 12;
  const chartW = pageW - 72;
  const chartH = 140;
  doc.setFillColor(252, 250, 244);
  doc.roundedRect(chartX, chartY, chartW, chartH, 8, 8, "F");
  doc.setDrawColor(228, 224, 210);
  doc.roundedRect(chartX, chartY, chartW, chartH, 8, 8, "S");

  const max = Math.max(1, ...opts.trend.bars.map((b) => b.value));
  const barCount = opts.trend.bars.length || 1;
  const innerW = chartW - 24;
  const slotW = innerW / barCount;
  const barW = Math.min(28, slotW - 8);
  opts.trend.bars.forEach((b, i) => {
    const ratio = b.value / max;
    const h = (chartH - 36) * ratio;
    const bx = chartX + 12 + i * slotW + (slotW - barW) / 2;
    const by = chartY + chartH - 22 - h;
    doc.setFillColor(...BRAND.primary);
    doc.roundedRect(bx, by, barW, h, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 110);
    doc.text(b.label, bx + barW / 2, chartY + chartH - 8, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.ink);
    doc.text(String(b.value), bx + barW / 2, by - 4, { align: "center" });
  });
  y = chartY + chartH + 24;

  // Distribution
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND.ink);
  doc.text(opts.distribution.title, 36, y);

  autoTable(doc, {
    startY: y + 8,
    head: [["Segment", "Count", "Share"]],
    body: (() => {
      const total = opts.distribution.rows.reduce((a, r) => a + r.count, 0) || 1;
      return opts.distribution.rows.map((r) => [
        r.label,
        String(r.count),
        `${Math.round((r.count / total) * 100)}%`,
      ]);
    })(),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 6, textColor: [40, 42, 38], lineColor: [228, 224, 210], lineWidth: 0.5 },
    headStyles: { fillColor: BRAND.primary, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, halign: "left" },
    alternateRowStyles: { fillColor: [248, 246, 238] },
    margin: { left: 36, right: 36 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
  });

  // Footer
  doc.setDrawColor(228, 224, 210);
  doc.setLineWidth(0.5);
  doc.line(36, pageH - 36, pageW - 36, pageH - 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 130);
  doc.text(`${BRAND.name} • Confidential analytics`, 36, pageH - 22);
  doc.text(`Page 1`, pageW - 36, pageH - 22, { align: "right" });

  doc.save(opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`);
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
