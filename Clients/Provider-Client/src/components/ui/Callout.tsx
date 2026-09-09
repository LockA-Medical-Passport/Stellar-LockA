import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  info: "border-brand-blue/25 bg-brand-blue/8 text-brand-blue",
  success: "border-brand-green/25 bg-brand-green/8 text-brand-green",
  warning: "border-brand-amber/25 bg-brand-amber/8 text-brand-amber",
  danger: "border-brand-red/25 bg-brand-red/8 text-brand-red",
} as const;

export type CalloutTone = keyof typeof TONES;

export interface CalloutProps {
  tone?: CalloutTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Inline notice for verification state, privacy rules, and blocked actions. */
export function Callout({ tone = "info", title, children, action, className }: CalloutProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-xl border p-4",
        TONES[tone],
        className,
      )}
    >
      <ToneIcon tone={tone} />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {children && <div className="mt-0.5 text-sm text-foreground/70">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function ToneIcon({ tone }: { tone: CalloutTone }) {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {tone === "success" ? (
        <path
          d="M6.25 10.5 8.75 13 14 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : tone === "danger" ? (
        <path
          d="M7.25 7.25l5.5 5.5M12.75 7.25l-5.5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M10 6.25v.5M10 9v4.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
