"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { usePassportData } from "@/features/passport/usePassportData";
import { RECORD_TYPE_LABELS, RECORD_TYPE_OPTIONS, type RecordStatus } from "@/lib/domain";
import { pluralize } from "@/lib/format";
import { RecordCard } from "./RecordCard";

const STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  { value: "Active", label: "Active" },
  { value: "Amended", label: "Amended" },
  { value: "Revoked", label: "Revoked" },
];

export function RecordsView() {
  const { records } = usePassportData();
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
        record.providerName.toLowerCase().includes(needle) ||
        RECORD_TYPE_LABELS[record.recordType].toLowerCase().includes(needle)
      );
    });
  }, [records, query, type, status]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Medical records"
        description="Everything verified providers have added to your passport. Files stay encrypted off-chain; each one carries a hash you can check."
      />

      <Card compact>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <Input
            label="Search"
            placeholder="Record, provider, or category"
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
            title={records.length === 0 ? "No records yet" : "Nothing matches those filters"}
            description={
              records.length === 0
                ? "Records appear here once a verified provider adds one to your passport."
                : "Try a different category, status, or search term."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <RecordCard key={record.recordId} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
