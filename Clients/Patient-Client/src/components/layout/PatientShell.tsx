"use client";

import { type ReactNode } from "react";
import { usePassportData } from "@/features/passport/usePassportData";
import { AppShell } from "./AppShell";
import {
  ActivityIcon,
  ConsentIcon,
  GearIcon,
  GridIcon,
  PassportIcon,
  RecordsIcon,
  type NavItem,
} from "./Sidebar";

export function PatientShell({ children }: { children: ReactNode }) {
  const { pendingRequests } = usePassportData();

  const navItems: NavItem[] = [
    { href: "/", label: "Overview", icon: <GridIcon /> },
    { href: "/passport", label: "My passport", icon: <PassportIcon /> },
    { href: "/records", label: "Medical records", icon: <RecordsIcon /> },
    { href: "/consent", label: "Consent", icon: <ConsentIcon />, count: pendingRequests.length },
    { href: "/activity", label: "Activity", icon: <ActivityIcon /> },
    { href: "/settings", label: "Settings", icon: <GearIcon /> },
  ];

  return (
    <AppShell brandSubtitle="Patient passport" navItems={navItems}>
      {children}
    </AppShell>
  );
}
