"use client";

import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePassportData } from "@/features/passport/usePassportData";
import { pluralize } from "@/lib/format";
import { AccessRequestCard } from "./AccessRequestCard";

export function ConsentView() {
  const { accessRequests, pendingRequests, activeGrants, refresh } = usePassportData();
  const history = accessRequests.filter(
    (request) => request.status !== "Pending" && request.status !== "Approved",
  );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Consent"
        description="Every request to read your records, and every grant you have open."
        action={
          <Button variant="secondary" size="sm" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      {accessRequests.length === 0 && (
        <Card>
          <EmptyState
            title="No requests yet"
            description="When a hospital, clinic, laboratory, pharmacy, or insurer asks to read part of your passport, it appears here first."
          />
        </Card>
      )}

      {pendingRequests.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-rule">
            Awaiting your decision · {pendingRequests.length}
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-brand-amber/25 to-transparent"
            />
          </h2>
          <Callout tone="warning" title="Grant only what the visit needs">
            You can approve a narrower window than the one asked for, and close any grant early.
          </Callout>
          {pendingRequests.map((request) => (
            <AccessRequestCard key={request.accessId} request={request} />
          ))}
        </section>
      )}

      {activeGrants.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-rule">
            Open grants · {activeGrants.length}
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-brand-green/25 to-transparent"
            />
          </h2>
          {activeGrants.map((request) => (
            <AccessRequestCard key={request.accessId} request={request} />
          ))}
        </section>
      )}

      {history.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-rule">
            History · {pluralize(history.length, "request")}
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent"
            />
          </h2>
          {history.map((request) => (
            <AccessRequestCard key={request.accessId} request={request} />
          ))}
        </section>
      )}
    </div>
  );
}
