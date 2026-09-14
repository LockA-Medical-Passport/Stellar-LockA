"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import {
  RECORD_TYPE_LABELS,
  RECORD_TYPE_OPTIONS,
  formatPassportId,
  type RecordStatus,
} from "@/lib/domain";
import { pluralize } from "@/lib/format";
import { RecordCard } from "./RecordCard";

const STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  { value: "Active", label: "Active" },
  { value: "Amended", label: "Amended" },
  { value: "Revoked", label: "Revoked" },
];

export function IssuedRecordsView() {
  const { records, refresh, canPractise } = usePractitionerData();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      if (type !== "all" && record.recordType !== type) return false;
      if (status !== "all" && record.status !== (status as RecordStatus)) return false;
      if (!needle) return true;
      return (
        record.title.toLowerCase().includes(needle) ||
        formatPassportId(record.passportId).toLowerCase().includes(needle) ||
        RECORD_TYPE_LABELS[record.recordType].toLowerCase().includes(needle)
      );
    });
  }, [records, query, type, status]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Issued records"
        description="Records you have issued to a patient passport, each stamped with your practitioner id."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={refresh}>
              Refresh
            </Button>
            {canPractise && (
              <LinkButton href="/records/new" size="sm">
                Add record
              </LinkButton>
            )}
          </div>
        }
      />

      <Card compact>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <Input
            label="Search"
            placeholder="Record, passport id, or category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            label="Category"
            value={type}
            onChange={(event) => setType(event.target.value)}
            options={[{ value: "all", label: "Any category" }, ...RECORD_TYPE_OPTIONS]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
      </Card>

      <p className="text-sm text-foreground/50">
        {filtered.length === records.length
          ? pluralize(records.length, "record")
          : `${filtered.length} of ${pluralize(records.length, "record")}`}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title={records.length === 0 ? "No records issued yet" : "Nothing matches those filters"}
            description={
              records.length === 0
                ? "Adding a record needs a live grant from the patient. Request access first."
                : "Try a different category, status, or search term."
            }
            action={
              records.length === 0 && canPractise ? (
                <LinkButton href="/records/new">Add record</LinkButton>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <RecordCard key={record.recordId} record={record} manageable />
          ))}
        </div>
      )}
    </div>
  );
}
