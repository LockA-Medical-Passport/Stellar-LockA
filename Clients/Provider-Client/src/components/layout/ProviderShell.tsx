"use client";

import { type ReactNode } from "react";
import { useProviderData } from "@/features/provider/useProviderData";
import { AppShell } from "./AppShell";
import {
  BuildingIcon,
  ConsentIcon,
  GearIcon,
  GridIcon,
  PassportIcon,
  RecordsIcon,
  ShieldCheckIcon,
  type NavItem,
} from "./Sidebar";

export function ProviderShell({ children }: { children: ReactNode }) {
  const { pendingRequests } = useProviderData();

  const navItems: NavItem[] = [
    { href: "/", label: "Overview", icon: <GridIcon /> },
    { href: "/patients", label: "Patients", icon: <PassportIcon /> },
    {
      href: "/access",
      label: "Access requests",
      icon: <ConsentIcon />,
      count: pendingRequests.length,
    },
    { href: "/records", label: "Issued records", icon: <RecordsIcon /> },
    { href: "/verify", label: "Verify a document", icon: <ShieldCheckIcon /> },
    { href: "/profile", label: "Organisation", icon: <BuildingIcon /> },
    { href: "/settings", label: "Settings", icon: <GearIcon /> },
  ];

  return (
    <AppShell brandSubtitle="Provider portal" navItems={navItems}>
      {children}
    </AppShell>
  );
}
