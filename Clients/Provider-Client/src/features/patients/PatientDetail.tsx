"use client";

import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { Card, InfoGrid, InfoRow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProviderData } from "@/features/provider/useProviderData";
import { RecordCard } from "@/features/records/RecordCard";
import { RECORD_SCOPE_DESCRIPTIONS, RECORD_SCOPE_LABELS, formatPassportId } from "@/lib/domain";
import { formatDateTime, formatDuration, formatRelative, pluralize } from "@/lib/format";

export interface PatientDetailProps {
  passportId: number;
}

export function PatientDetail({ passportId }: PatientDetailProps) {
  const { provider, liveGrants, patientRecords, accessRequests, isVerified } = useProviderData();
  const grant = liveGrants.find((candidate) => candidate.passportId === passportId);
  const everRequested = accessRequests.some((request) => request.passportId === passportId);

  if (!grant) {
    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader title={formatPassportId(passportId)} />
        <Callout tone="warning" title="No open grant for this passport">
          {everRequested
            ? "Your grant has expired, been revoked, or was never approved. Nothing about this patient is readable until they approve a new request."
            : "You have never held a grant for this passport. Send a request and wait for the patient to approve it."}
        </Callout>
        <div className="flex gap-2">
          <LinkButton href="/patients" variant="secondary">
            Back to patients
          </LinkButton>
          {isVerified && <LinkButton href="/access/new">Request access</LinkButton>}
        </div>
      </div>
    );
  }

  const readable = patientRecords[passportId] ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={formatPassportId(passportId)}
        description={`Readable under grant #${grant.accessId} until ${formatDateTime(grant.expiresAt)}`}
        action={
          isVerified ? (
            <LinkButton href={`/records/new?passport=${passportId}`} size="sm">
              Add record
            </LinkButton>
          ) : undefined
        }
      />

      <Card title="Your grant">
        <InfoGrid>
          <InfoRow label="Scope">
            <span className="flex flex-wrap items-center gap-2">
              {RECORD_SCOPE_LABELS[grant.recordScope]}
              <Badge variant="green">Open</Badge>
            </span>
            <p className="mt-1 text-xs text-foreground/45">
              {RECORD_SCOPE_DESCRIPTIONS[grant.recordScope]}
            </p>
          </InfoRow>
          <InfoRow label="Window">{formatDuration(grant.durationSeconds)}</InfoRow>
          <InfoRow label="Closes">
            {formatRelative(grant.expiresAt)}
            <p className="mt-1 text-xs text-foreground/45">{formatDateTime(grant.expiresAt)}</p>
          </InfoRow>
          <InfoRow label="Stated purpose">
            <span className="text-foreground/70">{grant.purpose}</span>
          </InfoRow>
        </InfoGrid>
      </Card>

      <section className="space-y-3">
        <h2 className="section-rule">
          Readable records · {pluralize(readable.length, "record")}
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent"
          />
        </h2>

        {readable.length === 0 ? (
          <Card>
            <EmptyState
              title="Nothing to read under this scope"
              description={`The patient holds no records in the ${RECORD_SCOPE_LABELS[
                grant.recordScope
              ].toLowerCase()} category, or the records they hold sit outside it.`}
            />
          </Card>
        ) : (
          readable.map((record) => (
            <RecordCard
              key={record.recordId}
              record={record}
              manageable={record.providerId === provider?.providerId}
            />
          ))
        )}
      </section>
    </div>
  );
}
