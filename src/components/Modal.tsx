import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  if (!open) return null;
  const widths = { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" } as const;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-soil/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${widths[size]} max-h-[90vh] overflow-y-auto rounded-2xl border border-sprout/30 bg-glass p-6 shadow-soft`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-soil">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-sprout/40 bg-glass p-1.5 text-soil/60 hover:text-fern"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-soil/60">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-sprout/40 bg-mist/60 px-3 py-2 text-sm text-soil outline-none focus:border-fern focus:bg-glass";
