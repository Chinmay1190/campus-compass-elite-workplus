import { GraduationCap } from "lucide-react";

export function LoadingScreen({ label = "Preparing your workspace" }: { label?: string }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-mist">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,var(--sprout)_0%,transparent_45%),radial-gradient(circle_at_85%_90%,color-mix(in_oklab,var(--gold)_35%,transparent)_0%,transparent_50%)] opacity-70" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <span className="absolute inset-0 -m-2 animate-ping rounded-2xl bg-fern/20" />
          <span className="relative flex size-14 items-center justify-center rounded-2xl bg-fern text-primary-foreground shadow-elevated ring-4 ring-gold/30">
            <GraduationCap className="size-7" />
          </span>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl text-fern tracking-tight">Verdant Academy</div>
          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-soil/55">{label}</div>
        </div>
        <div className="relative h-1 w-44 overflow-hidden rounded-full bg-sprout/40">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-[loader_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-fern via-gold to-fern" />
        </div>
      </div>
      <style>{`@keyframes loader { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }`}</style>
    </div>
  );
}
