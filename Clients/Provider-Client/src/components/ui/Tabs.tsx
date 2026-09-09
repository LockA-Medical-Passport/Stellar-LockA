"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TabItem {
  href: string;
  label: string;
  /** Count shown as a pill on the tab, e.g. pending consent requests. */
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  className?: string;
}

/**
 * Route-driven tab bar. Each tab is a real link so a patient can bookmark or
 * share the exact view they are looking at.
 */
export function Tabs({ items, className }: TabsProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-wrap gap-2", className)} aria-label="Section">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-locka-cyan/30 bg-locka-cyan/15 text-locka-cyan"
                : "border-transparent text-foreground/60 hover:bg-white/5 hover:text-foreground",
            )}
          >
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-xs font-semibold",
                  active ? "bg-locka-cyan/20" : "bg-white/10 text-foreground/70",
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
