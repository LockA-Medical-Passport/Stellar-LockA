"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import { RECORD_SCOPE_LABELS, formatPassportId } from "@/lib/domain";
import { formatDateTime, formatRelative, pluralize } from "@/lib/format";

/**
 * The patients this provider can read right now.
 *
 * Deliberately derived from live grants only: a passport with no open grant is
 * not a patient this organisation has any view of.
 */
export function PatientsView() {
  const { liveGrants, patientRecords, refresh, canPractise } = usePractitionerData();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Patients"
        description="Passports with an open grant for you. Access closes on its own when the window ends."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={refresh}>
              Refresh
            </Button>
            {canPractise && (
              <LinkButton href="/access/new" size="sm">
                Request access
              </LinkButton>
            )}
          </div>
        }
      />

      {liveGrants.length === 0 ? (
        <Card>
          <EmptyState
            title="No open grants"
            description="You cannot read any patient's records right now. Request access with a passport id and wait for the patient to approve it."
            action={
              canPractise ? <LinkButton href="/access/new">Request access</LinkButton> : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {liveGrants.map((grant) => {
            const readable = patientRecords[grant.passportId] ?? [];
            return (
              <Card key={grant.accessId}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-mono text-sm font-semibold text-foreground">
                      {formatPassportId(grant.passportId)}
                    </h3>
                    <p className="mt-1 text-xs text-foreground/50">
                      Granted {formatRelative(grant.requestedAt)}
                    </p>
                  </div>
                  <Badge variant="green">Open</Badge>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-foreground/50">You can read</dt>
                    <dd className="text-sm text-foreground/90">
                      {RECORD_SCOPE_LABELS[grant.recordScope]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-foreground/50">Closes</dt>
                    <dd className="text-sm text-foreground/90">
                      {formatRelative(grant.expiresAt)}
                    </dd>
                    <p className="mt-0.5 text-xs text-foreground/45">
                      {formatDateTime(grant.expiresAt)}
                    </p>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-foreground/50">
                    {pluralize(readable.length, "record")} readable
                  </p>
                  <LinkButton href={`/patients/${grant.passportId}`} size="sm" variant="secondary">
                    Open records
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
