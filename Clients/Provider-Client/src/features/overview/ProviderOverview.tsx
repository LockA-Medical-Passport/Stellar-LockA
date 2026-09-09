"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { useProviderData } from "@/features/provider/useProviderData";
import {
  AUDIT_EVENT_LABELS,
  PROVIDER_STATUS_LABELS,
  PROVIDER_STATUS_VARIANTS,
  PROVIDER_TYPE_LABELS,
  RECORD_SCOPE_LABELS,
  formatPassportId,
  type Provider,
} from "@/lib/domain";
import { formatRelative, pluralize } from "@/lib/format";

export function ProviderOverview({ provider }: { provider: Provider }) {
  const { accessRequests, pendingRequests, liveGrants, records, auditEvents, refresh, isVerified } =
    useProviderData();

  const recentEvents = auditEvents.slice(0, 6);
  const activeRecords = records.filter((record) => record.status === "Active");

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={provider.name}
        description={`${PROVIDER_TYPE_LABELS[provider.providerType]} · ${provider.country} · registered ${formatRelative(provider.registeredAt)}`}
        action={
          <Button variant="secondary" size="sm" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      {!isVerified && (
        <Callout
          tone={provider.status === "Pending" ? "warning" : "danger"}
          title={
            provider.status === "Pending"
              ? "Awaiting administrator verification"
              : `Registration ${provider.status.toLowerCase()}`
          }
          action={
            <LinkButton href="/profile" size="sm" variant="secondary">
              Organisation
            </LinkButton>
          }
        >
          Requesting patient access and writing records stay locked until this organisation is
          verified in the provider registry.
        </Callout>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registry status"
          accent={isVerified ? "green" : "amber"}
          value={
            <Badge variant={PROVIDER_STATUS_VARIANTS[provider.status]}>
              {PROVIDER_STATUS_LABELS[provider.status]}
            </Badge>
          }
          detail={PROVIDER_TYPE_LABELS[provider.providerType]}
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
          label="Awaiting patients"
          accent={pendingRequests.length > 0 ? "amber" : "gray"}
          value={pendingRequests.length}
          detail={pendingRequests.length > 0 ? "Requests sent, undecided" : "Nothing outstanding"}
        />
        <StatCard
          label="Records issued"
          accent="cyan"
          value={records.length}
          detail={`${activeRecords.length} active`}
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
                isVerified ? <LinkButton href="/access/new">Request access</LinkButton> : undefined
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

      <Card title="What to do next">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NextStep
            title="Request access"
            body="Ask a patient for one record category and one window."
            href="/access/new"
            disabled={!isVerified}
          />
          <NextStep
            title="Add a record"
            body="Anchor a record against a passport you hold a grant for."
            href="/records/new"
            disabled={!isVerified || liveGrants.length === 0}
          />
          <NextStep
            title="Verify a document"
            body="Check a file against the commitment held for its record."
            href="/verify"
          />
        </div>
        <p className="mt-4 text-xs text-foreground/45">
          {pluralize(accessRequests.length, "request")} sent in total.
        </p>
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
