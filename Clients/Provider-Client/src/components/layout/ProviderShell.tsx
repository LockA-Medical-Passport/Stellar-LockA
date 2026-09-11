"use client";

import { type ReactNode } from "react";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import { AppShell } from "./AppShell";
import {
  ConsentIcon,
  GearIcon,
  GridIcon,
  PassportIcon,
  RecordsIcon,
  ShieldCheckIcon,
  UserIcon,
  type NavItem,
} from "./Sidebar";

export function ProviderShell({ children }: { children: ReactNode }) {
  const { pendingRequests } = usePractitionerData();

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
    { href: "/profile", label: "My registration", icon: <UserIcon /> },
    { href: "/settings", label: "Settings", icon: <GearIcon /> },
  ];

  return (
    <AppShell brandSubtitle="Practitioner portal" navItems={navItems}>
      {children}
    </AppShell>
  );
}
