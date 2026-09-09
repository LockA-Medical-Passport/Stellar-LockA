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
import { usePassportData } from "@/features/passport/usePassportData";
import { RecordCard } from "@/features/records/RecordCard";
import {
  AUDIT_EVENT_LABELS,
  PASSPORT_STATUS_LABELS,
  PASSPORT_STATUS_VARIANTS,
  RECORD_SCOPE_LABELS,
  formatPassportId,
  type Passport,
} from "@/lib/domain";
import { formatDuration, formatRelative, pluralize } from "@/lib/format";
import { shortAddress, shortHash } from "@/lib/stellar";

export function OverviewDashboard({ passport }: { passport: Passport }) {
  const { records, pendingRequests, activeGrants, auditEvents, refresh } = usePassportData();
  const recentRecords = records.slice(0, 3);
  const recentEvents = auditEvents.slice(0, 6);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Overview"
        description={`Passport ${formatPassportId(passport.passportId)} · created ${formatRelative(passport.createdAt)}`}
        action={
          <Button variant="secondary" size="sm" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      {pendingRequests.length > 0 && (
        <Callout
          tone="warning"
          title={`${pluralize(pendingRequests.length, "provider")} waiting on your decision`}
          action={
            <LinkButton href="/consent" size="sm" variant="amber">
              Review
            </LinkButton>
          }
        >
          {pendingRequests
            .map(
              (request) =>
                `${request.providerName} — ${RECORD_SCOPE_LABELS[request.recordScope].toLowerCase()}`,
            )
            .join("; ")}
        </Callout>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Passport"
          accent={passport.status === "Active" ? "green" : "amber"}
          value={
            <Badge variant={PASSPORT_STATUS_VARIANTS[passport.status]}>
              {PASSPORT_STATUS_LABELS[passport.status]}
            </Badge>
          }
          detail={formatPassportId(passport.passportId)}
        />
        <StatCard
          label="Records"
          accent="cyan"
          value={records.length}
          detail={records.length > 0 ? `Latest ${formatRelative(records[0].issuedAt)}` : "None yet"}
        />
        <StatCard
          label="Active grants"
          accent="blue"
          value={activeGrants.length}
          detail={
            activeGrants.length > 0
              ? `Next expires ${formatRelative(Math.min(...activeGrants.map((grant) => grant.expiresAt)))}`
              : "No provider can read your records"
          }
        />
        <StatCard
          label="Awaiting you"
          accent={pendingRequests.length > 0 ? "amber" : "gray"}
          value={pendingRequests.length}
          detail={pendingRequests.length > 0 ? "Consent requests" : "Nothing to review"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card
          title="Who can read your records"
          action={
            <LinkButton href="/consent" size="sm" variant="secondary">
              Manage
            </LinkButton>
          }
        >
          {activeGrants.length === 0 ? (
            <EmptyState
              title="No active grants"
              description="Nobody can read your records right now. Approving a request opens a window you can close at any time."
            />
          ) : (
            <ul className="divide-y divide-white/5">
              {activeGrants.map((grant) => (
                <li key={grant.accessId} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {grant.providerName}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/50">
                      {RECORD_SCOPE_LABELS[grant.recordScope]} ·{" "}
                      {formatDuration(grant.durationSeconds)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-foreground/45">
                    expires {formatRelative(grant.expiresAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Recent activity"
          action={
            <LinkButton href="/activity" size="sm" variant="secondary">
              View all
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

      <Card
        title="Latest records"
        action={
          <LinkButton href="/records" size="sm" variant="secondary">
            All records
          </LinkButton>
        }
      >
        {recentRecords.length === 0 ? (
          <EmptyState
            title="No records yet"
            description="Records appear here once a verified provider adds one to your passport."
          />
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <RecordCard key={record.recordId} record={record} />
            ))}
          </div>
        )}
      </Card>

      <Card title="Passport identity">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="mb-1 text-xs text-foreground/50">Passport id</dt>
            <dd>
              <CopyableValue
                value={String(passport.passportId)}
                display={formatPassportId(passport.passportId)}
              />
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs text-foreground/50">Identity commitment</dt>
            <dd>
              <CopyableValue
                value={passport.publicIdentityHash}
                display={shortHash(passport.publicIdentityHash)}
              />
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs text-foreground/50">Recovery account</dt>
            <dd>
              {passport.recoveryAddress ? (
                <CopyableValue
                  value={passport.recoveryAddress}
                  display={shortAddress(passport.recoveryAddress)}
                />
              ) : (
                <span className="text-sm text-brand-amber">Not set</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
