"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Table, type TableColumn } from "@/components/ui/Table";
import { usePassportData } from "@/features/passport/usePassportData";
import { AUDIT_EVENT_LABELS, type AuditEvent, type AuditEventKind } from "@/lib/domain";
import { formatDateTime, formatRelative } from "@/lib/format";
import { shortTxHash, stellarTxUrl } from "@/lib/stellar";
import type { BadgeVariant } from "@/components/ui/Badge";

const KIND_VARIANTS: Record<AuditEventKind, BadgeVariant> = {
  PassportCreated: "cyan",
  RecoveryUpdated: "cyan",
  PractitionerRegistered: "cyan",
  AccessRequested: "amber",
  AccessApproved: "green",
  AccessRejected: "red",
  AccessRevoked: "gray",
  AccessExpired: "gray",
  RecordAdded: "blue",
  RecordAmended: "blue",
  RecordRevoked: "red",
};

const GROUPS = [
  { value: "all", label: "Everything" },
  { value: "access", label: "Access decisions" },
  { value: "records", label: "Record changes" },
  { value: "passport", label: "Passport changes" },
];

function groupOf(kind: AuditEventKind) {
  if (kind.startsWith("Access")) return "access";
  if (kind.startsWith("Record")) return "records";
  return "passport";
}

/**
 * The audit trail the platform promises the patient: who asked, who was let in,
 * and what changed, each entry linked to the transaction that carried it.
 */
export function ActivityView() {
  const { auditEvents, loading } = usePassportData();
  const [group, setGroup] = useState("all");

  const rows = useMemo(
    () =>
      group === "all" ? auditEvents : auditEvents.filter((event) => groupOf(event.kind) === group),
    [auditEvents, group],
  );

  const columns: TableColumn<AuditEvent>[] = [
    {
      key: "event",
      header: "Event",
      render: (event) => (
        <Badge variant={KIND_VARIANTS[event.kind]} dot={false}>
          {AUDIT_EVENT_LABELS[event.kind]}
        </Badge>
      ),
    },
    {
      key: "summary",
      header: "Detail",
      render: (event) => <span className="text-foreground/80">{event.summary}</span>,
    },
    {
      key: "actor",
      header: "Actor",
      sortable: true,
      sortValue: (event) => event.actor,
      render: (event) => <span className="text-foreground/70">{event.actor}</span>,
    },
    {
      key: "at",
      header: "When",
      sortable: true,
      sortValue: (event) => event.at,
      render: (event) => (
        <span title={formatDateTime(event.at)} className="text-foreground/70">
          {formatRelative(event.at)}
        </span>
      ),
    },
    {
      key: "tx",
      header: "Transaction",
      render: (event) => (
        <a
          href={stellarTxUrl(event.txHash)}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-locka-cyan hover:underline"
        >
          {shortTxHash(event.txHash)}
        </a>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Activity"
        description="Every consent decision and record change on your passport, in order."
      />

      <Card compact>
        <Select
          label="Show"
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          options={GROUPS}
          className="sm:max-w-xs"
        />
      </Card>

      <Table
        columns={columns}
        data={rows}
        getRowId={(event) => event.id}
        loading={loading}
        initialSort={{ key: "at", direction: "desc" }}
        emptyState={
          <EmptyState
            title="Nothing recorded yet"
            description="Activity appears here as providers request access and add records."
          />
        }
      />
    </div>
  );
}
