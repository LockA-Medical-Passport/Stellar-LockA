"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { useProviderData } from "@/features/provider/useProviderData";
import {
  ACCESS_STATUS_LABELS,
  ACCESS_STATUS_VARIANTS,
  RECORD_SCOPE_LABELS,
  formatPassportId,
  type AccessRequest,
} from "@/lib/domain";
import { formatDateTime, formatDuration, formatRelative } from "@/lib/format";
import { locka } from "@/lib/locka-client";
import { errorMessage } from "@/lib/utils";

export interface AccessRequestCardProps {
  request: AccessRequest;
}

/** One request this provider sent, and what can still be done with it. */
export function AccessRequestCard({ request }: AccessRequestCardProps) {
  const { refresh } = useProviderData();
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    setRevoking(true);
    const pendingId = toast.pending("Handing back access…");
    try {
      const { txHash } = await locka.revokeAccess(request.accessId);
      toast.success(`Access to ${formatPassportId(request.passportId)} handed back.`, {
        title: "Access closed",
        txHash,
      });
      await refresh();
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Could not close access" });
    } finally {
      dismissToast(pendingId);
      setRevoking(false);
    }
  }

  return (
    <article className="glass rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-semibold text-foreground">
            {formatPassportId(request.passportId)}
          </h3>
          <p className="mt-1 text-xs text-foreground/50">
            Sent {formatRelative(request.requestedAt)} · request #{request.accessId}
          </p>
        </div>
        <Badge variant={ACCESS_STATUS_VARIANTS[request.status]}>
          {ACCESS_STATUS_LABELS[request.status]}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-foreground/50">Scope</dt>
          <dd className="text-sm text-foreground/90">{RECORD_SCOPE_LABELS[request.recordScope]}</dd>
        </div>
        <div>
          <dt className="text-xs text-foreground/50">Window</dt>
          <dd className="text-sm text-foreground/90">{formatDuration(request.durationSeconds)}</dd>
        </div>
        <div>
          <dt className="text-xs text-foreground/50">
            {request.status === "Approved" ? "Expires" : "Status"}
          </dt>
          <dd className="text-sm text-foreground/90">
            {request.status === "Approved" && request.expiresAt > 0
              ? `${formatRelative(request.expiresAt)} · ${formatDateTime(request.expiresAt)}`
              : request.status === "Pending"
                ? "Waiting on the patient"
                : ACCESS_STATUS_LABELS[request.status]}
          </dd>
        </div>
      </dl>

      {request.purpose && (
        <p className="mt-4 rounded-lg border border-white/10 bg-navy-800/40 p-3 text-sm text-foreground/70">
          {request.purpose}
        </p>
      )}

      {request.status === "Approved" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={`/patients/${request.passportId}`} size="sm" variant="secondary">
            Open records
          </LinkButton>
          <Button variant="amber" size="sm" loading={revoking} onClick={handleRevoke}>
            Hand back access
          </Button>
        </div>
      )}
    </article>
  );
}
