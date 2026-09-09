import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Uppercase label rendered above the card body with a trailing hairline. */
  title?: ReactNode;
  /** Right-aligned controls on the title row. */
  action?: ReactNode;
  /** Tightens padding for dense list rows. */
  compact?: boolean;
}

export function Card({ title, action, compact, className, children, ...props }: CardProps) {
  return (
    <section
      className={cn("glass rounded-xl", compact ? "p-4" : "p-5 sm:p-6", className)}
      {...props}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center gap-3">
          {title && (
            <h2 className="section-rule flex-1">
              {title}
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent"
              />
            </h2>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export interface InfoRowProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** Label-above-value pair used throughout the detail cards. */
export function InfoRow({ label, children, className }: InfoRowProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="mb-1 text-xs text-foreground/50">{label}</dt>
      <dd className="text-sm text-foreground/90">{children}</dd>
    </div>
  );
}

export interface InfoGridProps {
  children: ReactNode;
  className?: string;
}

export function InfoGrid({ children, className }: InfoGridProps) {
  return <dl className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}>{children}</dl>;
}
