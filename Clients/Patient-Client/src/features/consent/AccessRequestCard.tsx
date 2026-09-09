"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { usePassportData } from "@/features/passport/usePassportData";
import {
  ACCESS_STATUS_LABELS,
  ACCESS_STATUS_VARIANTS,
  PROVIDER_TYPE_LABELS,
  RECORD_SCOPE_DESCRIPTIONS,
  RECORD_SCOPE_LABELS,
  type AccessRequest,
} from "@/lib/domain";
import {
  ACCESS_DURATION_OPTIONS,
  formatDateTime,
  formatDuration,
  formatRelative,
} from "@/lib/format";
import { locka, type AccessDecision } from "@/lib/locka-client";
import { shortAddress } from "@/lib/stellar";
import { errorMessage } from "@/lib/utils";

export interface AccessRequestCardProps {
  request: AccessRequest;
}

/**
 * One consent decision, with the facts a patient needs before making it: who is
 * asking, what they would see, for how long, and why.
 */
export function AccessRequestCard({ request }: AccessRequestCardProps) {
  const { refresh } = usePassportData();
  const [busy, setBusy] = useState<AccessDecision | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [accessWindow, setAccessWindow] = useState(String(request.durationSeconds));

  async function decide(decision: AccessDecision, durationSeconds?: number) {
    setBusy(decision);
    const pendingId = toast.pending(
      decision === "approve"
        ? "Recording your approval on Stellar…"
        : decision === "reject"
          ? "Recording your rejection…"
          : "Revoking access…",
    );
    try {
      const { txHash } = await locka.decideAccess(request.accessId, decision, durationSeconds);
      const message =
        decision === "approve"
          ? `${request.providerName} can now read ${RECORD_SCOPE_LABELS[request.recordScope].toLowerCase()}.`
          : decision === "reject"
            ? `${request.providerName} was not granted access.`
            : `${request.providerName} can no longer read your records.`;
      toast.success(message, { title: "Consent updated", txHash });
      setApproveOpen(false);
      await refresh();
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Consent not updated" });
    } finally {
      dismissToast(pendingId);
      setBusy(null);
    }
  }

  const expiryLine =
    request.status === "Approved" && request.expiresAt > 0
      ? `Expires ${formatRelative(request.expiresAt)} · ${formatDateTime(request.expiresAt)}`
      : null;

  return (
    <article className="glass rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{request.providerName}</h3>
            <Badge variant="gray" dot={false}>
              {PROVIDER_TYPE_LABELS[request.providerType]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-foreground/50">
            Asked {formatRelative(request.requestedAt)} · request #{request.accessId}
          </p>
        </div>
        <Badge variant={ACCESS_STATUS_VARIANTS[request.status]}>
          {ACCESS_STATUS_LABELS[request.status]}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-foreground/50">Would be able to read</dt>
          <dd className="text-sm text-foreground/90">{RECORD_SCOPE_LABELS[request.recordScope]}</dd>
          <p className="mt-0.5 text-xs text-foreground/45">
            {RECORD_SCOPE_DESCRIPTIONS[request.recordScope]}
          </p>
        </div>
        <div>
          <dt className="text-xs text-foreground/50">For</dt>
          <dd className="text-sm text-foreground/90">{formatDuration(request.durationSeconds)}</dd>
          {expiryLine && <p className="mt-0.5 text-xs text-foreground/45">{expiryLine}</p>}
        </div>
      </dl>

      {request.purpose && (
        <p className="mt-4 rounded-lg border border-white/10 bg-navy-800/40 p-3 text-sm text-foreground/70">
          “{request.purpose}”
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <CopyableValue
          value={request.providerId}
          display={`Provider account ${shortAddress(request.providerId)}`}
        />

        <div className="flex flex-wrap gap-2">
          {request.status === "Pending" && (
            <>
              <Button
                variant="success"
                size="sm"
                loading={busy === "approve"}
                onClick={() => setApproveOpen(true)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={busy === "reject"}
                onClick={() => decide("reject")}
              >
                Reject
              </Button>
            </>
          )}
          {request.status === "Approved" && (
            <Button
              variant="amber"
              size="sm"
              loading={busy === "revoke"}
              onClick={() => decide("revoke")}
            >
              Revoke access
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        title={`Approve access for ${request.providerName}?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              loading={busy === "approve"}
              onClick={() => decide("approve", Number(accessWindow))}
            >
              Approve for {formatDuration(Number(accessWindow))}
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground/70">
          They will be able to read{" "}
          <strong className="font-medium text-foreground">
            {RECORD_SCOPE_LABELS[request.recordScope].toLowerCase()}
          </strong>{" "}
          until the window closes. You can revoke it sooner at any time.
        </p>
        <Select
          className="mt-4"
          label="Access window"
          value={accessWindow}
          onChange={(event) => setAccessWindow(event.target.value)}
          options={ACCESS_DURATION_OPTIONS}
          helperText={`They asked for ${formatDuration(request.durationSeconds)}. Granting less is allowed.`}
        />
      </Modal>
    </article>
  );
}
