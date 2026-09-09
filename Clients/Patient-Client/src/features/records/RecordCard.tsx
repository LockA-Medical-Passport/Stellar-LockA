"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { InfoGrid, InfoRow } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/format";
import {
  RECORD_STATUS_LABELS,
  RECORD_STATUS_VARIANTS,
  RECORD_TYPE_LABELS,
  type MedicalRecord,
} from "@/lib/domain";
import { shortHash } from "@/lib/stellar";
import { cn } from "@/lib/utils";
import { VerifyHashField } from "./VerifyHashField";

export interface RecordCardProps {
  record: MedicalRecord;
  /** Collapsed cards hide the on-chain detail until asked for. */
  defaultOpen?: boolean;
  className?: string;
}

export function RecordCard({ record, defaultOpen = false, className }: RecordCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={cn("glass rounded-xl p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{record.title}</h3>
            <Badge variant="blue" dot={false}>
              {RECORD_TYPE_LABELS[record.recordType]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-foreground/50">
            {record.providerName} · {formatDate(record.issuedAt)}
          </p>
        </div>
        <Badge variant={RECORD_STATUS_VARIANTS[record.status]}>
          {RECORD_STATUS_LABELS[record.status]}
        </Badge>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/60 transition-colors hover:text-locka-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
      >
        <svg
          viewBox="0 0 20 20"
          className={cn("size-3.5 transition-transform", open && "rotate-90")}
          aria-hidden="true"
        >
          <path
            d="M8 6l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {open ? "Hide on-chain detail" : "Show on-chain detail"}
      </button>

      {open && (
        <div className="animate-slide-up mt-4 space-y-4 border-t border-white/10 pt-4">
          <InfoGrid>
            <InfoRow label="Record id">
              <CopyableValue value={record.recordId} display={shortHash(record.recordId)} />
            </InfoRow>
            <InfoRow label="Issuing provider">
              <CopyableValue value={record.providerId} display={`${record.providerName}`} />
            </InfoRow>
            <InfoRow label="Encrypted file hash">
              <CopyableValue
                value={record.encryptedFileHash}
                display={shortHash(record.encryptedFileHash)}
              />
            </InfoRow>
            <InfoRow label="Storage pointer hash">
              <CopyableValue
                value={record.storagePointerHash}
                display={shortHash(record.storagePointerHash)}
              />
            </InfoRow>
          </InfoGrid>

          <div>
            <p className="mb-2 text-xs text-foreground/50">
              Check a file you were given against the commitment held for this record.
            </p>
            <VerifyHashField recordId={record.recordId} />
          </div>
        </div>
      )}
    </article>
  );
}

export function RecordCardSkeleton() {
  return (
    <div className="glass space-y-2 rounded-xl p-5">
      <Skeleton shape="text" className="w-1/3" />
      <Skeleton shape="text" className="w-1/4" />
    </div>
  );
}
