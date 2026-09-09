"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InfoGrid, InfoRow } from "@/components/ui/Card";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { useProviderData } from "@/features/provider/useProviderData";
import {
  RECORD_STATUS_LABELS,
  RECORD_STATUS_VARIANTS,
  RECORD_TYPE_LABELS,
  formatPassportId,
  type MedicalRecord,
  type RecordStatus,
} from "@/lib/domain";
import { formatDate } from "@/lib/format";
import { locka } from "@/lib/locka-client";
import { shortHash } from "@/lib/stellar";
import { cn } from "@/lib/utils";

export interface RecordCardProps {
  record: MedicalRecord;
  /** Shows amend and revoke controls. Only true for records you issued. */
  manageable?: boolean;
  className?: string;
}

export function RecordCard({ record, manageable = false, className }: RecordCardProps) {
  const { refresh } = useProviderData();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<RecordStatus | null>(null);
  const [busy, setBusy] = useState(false);

  async function applyStatus(status: RecordStatus) {
    setBusy(true);
    const pendingId = toast.pending(
      status === "Amended" ? "Marking the record amended…" : "Revoking the record…",
    );
    try {
      const { txHash } = await locka.updateRecordStatus(record.recordId, status);
      toast.success(`“${record.title}” is now ${status.toLowerCase()}.`, {
        title: "Record updated",
        txHash,
      });
      setConfirming(null);
      await refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : String(caught), {
        title: "Record not updated",
      });
    } finally {
      dismissToast(pendingId);
      setBusy(false);
    }
  }

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
            {formatPassportId(record.passportId)} · {record.providerName} ·{" "}
            {formatDate(record.issuedAt)}
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
            <InfoRow label="Passport">
              <CopyableValue
                value={String(record.passportId)}
                display={formatPassportId(record.passportId)}
              />
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

          {manageable && record.status !== "Revoked" && (
            <div className="flex flex-wrap gap-2">
              {record.status === "Active" && (
                <Button variant="secondary" size="sm" onClick={() => setConfirming("Amended")}>
                  Mark amended
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => setConfirming("Revoked")}>
                Revoke record
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        title={confirming === "Amended" ? "Mark this record amended?" : "Revoke this record?"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              variant={confirming === "Amended" ? "primary" : "danger"}
              loading={busy}
              onClick={() => confirming && applyStatus(confirming)}
            >
              {confirming === "Amended" ? "Mark amended" : "Revoke"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground/70">
          {confirming === "Amended"
            ? "The record stays on file and readable, flagged as superseded by a corrected version. Issue the correction as a new record."
            : "The record stays on file for the audit trail but is no longer valid, and revoking cannot be undone."}
        </p>
      </Modal>
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
