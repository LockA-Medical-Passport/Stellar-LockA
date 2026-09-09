"use client";

import { type ReactNode, useState } from "react";
import { config } from "@/lib/config";
import { Navbar } from "./Navbar";
import { Sidebar, type NavItem } from "./Sidebar";

export interface AppShellProps {
  brandSubtitle: string;
  navItems: NavItem[];
  children: ReactNode;
}

export function AppShell({ brandSubtitle, navItems, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-backdrop flex min-h-screen">
      <Sidebar
        brandSubtitle={brandSubtitle}
        navItems={navItems}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileNavOpen(true)} />
        {config.demoMode && <DemoBanner />}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

/**
 * Medical data that looks real but is not must say so. The banner stays until
 * the client reads from a live Soroban network.
 */
function DemoBanner() {
  return (
    <p className="flex items-center justify-center gap-2 border-b border-brand-amber/20 bg-brand-amber/10 px-4 py-1.5 text-center text-xs text-brand-amber">
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      Sample data. No wallet is connected to a live network and nothing here is a real medical
      record.
    </p>
  );
}
