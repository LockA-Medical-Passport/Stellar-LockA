"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { networkLabel } from "@/lib/config";
import { cn } from "@/lib/utils";
import { BrandLockup } from "./LockaLogo";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  /** Badge count, e.g. consent requests awaiting a decision. */
  count?: number;
}

export interface SidebarProps {
  /** Second brand line, naming this client. */
  brandSubtitle: string;
  navItems: NavItem[];
  mobileOpen?: boolean;
  onClose?: () => void;
}

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ brandSubtitle, navItems, mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={cn(
          "glass-bright fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-1 border-r border-white/10 p-4",
          "transition-transform duration-200 ease-out md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link
          href="/"
          onClick={onClose}
          className="mb-4 rounded-lg px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
        >
          <BrandLockup subtitle={brandSubtitle} />
        </Link>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-locka-cyan/10 text-locka-cyan"
                    : "text-foreground/60 hover:bg-white/5 hover:text-foreground",
                )}
              >
                <span className="size-4.5 shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="rounded-full bg-brand-amber/20 px-1.5 py-px text-xs font-semibold text-brand-amber">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <footer className="mt-2 border-t border-white/10 px-3 pt-3">
          <p className="flex items-center gap-2 text-xs text-foreground/40">
            <span className="size-1.5 rounded-full bg-locka-cyan" aria-hidden="true" />
            {networkLabel}
          </p>
        </footer>
      </aside>
    </>
  );
}

function iconProps() {
  return {
    viewBox: "0 0 20 20",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-full",
    "aria-hidden": true as const,
  };
}

export function GridIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
    </svg>
  );
}

export function PassportIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="4" y="2.5" width="12" height="15" rx="2" />
      <circle cx="10" cy="8" r="2.25" />
      <path d="M7 13.5h6" />
    </svg>
  );
}

export function RecordsIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M5.5 2.5h9a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 16V4a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M7.5 6.5h5M7.5 9.5h5M7.5 12.5h3" />
    </svg>
  );
}

export function ConsentIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M10 2.5 4 4.75v4.5c0 3.9 2.5 6.7 6 8.25 3.5-1.55 6-4.35 6-8.25v-4.5L10 2.5Z" />
      <path d="M7.5 10l2 2 3.5-3.75" />
    </svg>
  );
}

export function ActivityIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v4.25l2.75 1.75" />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="2.75" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" />
    </svg>
  );
}

export function BuildingIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3.5" y="2.5" width="9" height="15" rx="1" />
      <path d="M12.5 8h4v9.5h-4" />
      <path d="M6.5 6h1M9.5 6h1M6.5 9h1M9.5 9h1M6.5 12h1M9.5 12h1" />
    </svg>
  );
}

export function KeyIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="7" cy="7" r="3.5" />
      <path d="M9.5 9.5 16 16M13.5 13.5l1.5-1.5M15.5 15.5 17 14" />
    </svg>
  );
}

export function ShieldCheckIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M10 2.5 4 4.75v4.5c0 3.9 2.5 6.7 6 8.25 3.5-1.55 6-4.35 6-8.25v-4.5L10 2.5Z" />
      <path d="M7.5 9.75 9.5 12l3.25-3.75" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}
