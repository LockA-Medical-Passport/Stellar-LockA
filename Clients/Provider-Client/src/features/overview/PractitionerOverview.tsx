"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import {
  AUDIT_EVENT_LABELS,
  ORGANIZATION_TYPE_LABELS,
  PRACTITIONER_ROLE_LABELS,
  PROVIDER_STATUS_LABELS,
  PROVIDER_STATUS_VARIANTS,
  RECORD_SCOPE_LABELS,
  formatPassportId,
  formatPractitionerId,
  type Practitioner,
} from "@/lib/domain";
import { formatRelative, pluralize } from "@/lib/format";

export function PractitionerOverview({ practitioner }: { practitioner: Practitioner }) {
  const {
    accessRequests,
    pendingRequests,
    liveGrants,
    records,
    auditEvents,
    refresh,
    canPractise,
  } = usePractitionerData();

  const recentEvents = auditEvents.slice(0, 6);
  const activeRecords = records.filter((record) => record.status === "Active");

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={practitioner.fullName}
        description={`${PRACTITIONER_ROLE_LABELS[practitioner.role]} at ${practitioner.organizationName} · ${ORGANIZATION_TYPE_LABELS[practitioner.organizationType]}, ${practitioner.country}`}
        action={
          <Button variant="secondary" size="sm" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      {!canPractise && (
        <Callout
          tone="danger"
          title={`Registration ${PROVIDER_STATUS_LABELS[practitioner.status].toLowerCase()}`}
          action={
            <LinkButton href="/profile" size="sm" variant="secondary">
              My registration
            </LinkButton>
          }
        >
          Requesting patient access and issuing records are blocked while your registration is in
          this state.
        </Callout>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Practitioner id"
          accent="cyan"
          value={
            <span className="font-mono">{formatPractitionerId(practitioner.practitionerId)}</span>
          }
          detail="Stamped on everything you issue"
        />
        <StatCard
          label="Registry status"
          accent={canPractise ? "green" : "amber"}
          value={
            <Badge variant={PROVIDER_STATUS_VARIANTS[practitioner.status]}>
              {PROVIDER_STATUS_LABELS[practitioner.status]}
            </Badge>
          }
          detail={PRACTITIONER_ROLE_LABELS[practitioner.role]}
        />
        <StatCard
          label="Open grants"
          accent="blue"
          value={liveGrants.length}
          detail={
            liveGrants.length > 0
              ? `Next closes ${formatRelative(Math.min(...liveGrants.map((grant) => grant.expiresAt)))}`
              : "No patient records readable"
          }
        />
        <StatCard
          label="Records issued"
          accent="green"
          value={records.length}
          detail={`${activeRecords.length} active${pendingRequests.length > 0 ? ` · ${pendingRequests.length} request${pendingRequests.length === 1 ? "" : "s"} pending` : ""}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Patients you can read"
          action={
            <LinkButton href="/patients" size="sm" variant="secondary">
              View all
            </LinkButton>
          }
        >
          {liveGrants.length === 0 ? (
            <EmptyState
              title="No open grants"
              description="Request access with a patient's passport id. They choose the category and the window."
              action={
                canPractise ? <LinkButton href="/access/new">Request access</LinkButton> : undefined
              }
            />
          ) : (
            <ul className="divide-y divide-white/5">
              {liveGrants.map((grant) => (
                <li key={grant.accessId} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-foreground">
                      {formatPassportId(grant.passportId)}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/50">
                      {RECORD_SCOPE_LABELS[grant.recordScope]}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-foreground/45">
                    closes {formatRelative(grant.expiresAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent activity"
          action={
            <LinkButton href="/access" size="sm" variant="secondary">
              Requests
            </LinkButton>
          }
        >
          {recentEvents.length === 0 ? (
            <EmptyState title="Nothing recorded yet" />
          ) : (
            <ol className="divide-y divide-white/5">
              {recentEvents.map((event) => (
                <li key={event.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/90">{AUDIT_EVENT_LABELS[event.kind]}</p>
                    <p className="mt-0.5 truncate text-xs text-foreground/50">{event.summary}</p>
                  </div>
                  <span className="shrink-0 text-xs text-foreground/45">
                    {formatRelative(event.at)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card title="Your stamp">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-foreground/70">
              Every record and access request carries{" "}
              <span className="font-mono text-locka-cyan">
                {formatPractitionerId(practitioner.practitionerId)}
              </span>
              , alongside your name, role, and organisation. A patient reading a result years from
              now can still see who issued it.
            </p>
            <p className="mt-2 text-xs text-foreground/45">
              {pluralize(accessRequests.length, "request")} sent · licence{" "}
              {practitioner.licenseNumber}
            </p>
          </div>
          <CopyableValue
            value={formatPractitionerId(practitioner.practitionerId)}
            display="Copy id"
          />
        </div>
      </Card>

      <Card title="What to do next">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NextStep
            title="Request access"
            body="Ask a patient for one record category and one window."
            href="/access/new"
            disabled={!canPractise}
          />
          <NextStep
            title="Issue a record"
            body="Anchor a result against a passport you hold a grant for."
            href="/records/new"
            disabled={!canPractise || liveGrants.length === 0}
          />
          <NextStep
            title="Verify a document"
            body="Check a file against the commitment held for its record."
            href="/verify"
          />
        </div>
      </Card>
    </div>
  );
}

function NextStep({
  title,
  body,
  href,
  disabled = false,
}: {
  title: string;
  body: string;
  href: string;
  disabled?: boolean;
}) {
  const content = (
    <>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-foreground/55">{body}</p>
    </>
  );

  if (disabled) {
    return (
      <div className="rounded-xl border border-white/5 bg-navy-800/30 p-4 opacity-50">
        {content}
      </div>
    );
  }

  return (
    <LinkButton
      href={href}
      variant="ghost"
      className="h-auto flex-col items-start rounded-xl border border-white/10 bg-navy-800/40 p-4 text-left hover:border-locka-cyan/30"
    >
      {content}
    </LinkButton>
  );
}
