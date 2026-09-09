import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ACCENTS = {
  green: "text-brand-green bg-brand-green/10 border-brand-green/25",
  blue: "text-brand-blue bg-brand-blue/10 border-brand-blue/25",
  cyan: "text-locka-cyan bg-locka-cyan/10 border-locka-cyan/25",
  amber: "text-brand-amber bg-brand-amber/10 border-brand-amber/25",
  red: "text-brand-red bg-brand-red/10 border-brand-red/25",
  gray: "text-foreground/60 bg-white/5 border-white/10",
} as const;

export type StatAccent = keyof typeof ACCENTS;

export interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Small line under the value: a hash, a count qualifier, a timestamp. */
  detail?: ReactNode;
  icon?: ReactNode;
  accent?: StatAccent;
  className?: string;
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  accent = "gray",
  className,
}: StatCardProps) {
  return (
    <div className={cn("glass rounded-xl p-5 transition-colors hover:border-white/20", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-foreground/50 uppercase">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg border",
              ACCENTS[accent],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
      {detail && <div className="mt-1 truncate text-xs text-foreground/50">{detail}</div>}
    </div>
  );
}
