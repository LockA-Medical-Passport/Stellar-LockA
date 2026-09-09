"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CopyableValueProps {
  /** The full value written to the clipboard. */
  value: string;
  /** What is shown, when it differs from `value` (e.g. a truncated hash). */
  display?: string;
  className?: string;
}

/**
 * Renders an identifier with a copy button. Passport ids, record hashes, and
 * Stellar addresses are all values a patient has to hand to someone else, so
 * every one of them is copyable rather than shown truncated and unreachable.
 */
export function CopyableValue({ value, display, className }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard is unavailable (insecure context or denied permission).
      // The value stays selectable, so there is nothing to recover from.
    }
  }

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <span className="truncate font-mono text-xs text-foreground/85">{display ?? value}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className="shrink-0 rounded p-0.5 text-foreground/40 transition-colors hover:text-locka-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
      >
        {copied ? (
          <svg viewBox="0 0 20 20" className="size-3.5 text-brand-green" aria-hidden="true">
            <path
              d="M5 10.5l3.5 3.5L15 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="size-3.5" aria-hidden="true">
            <rect
              x="7.5"
              y="7.5"
              width="9"
              height="9"
              rx="1.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M12.5 4.5H5A.5.5 0 0 0 4.5 5v7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </span>
  );
}
