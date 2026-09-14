"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import { pluralize } from "@/lib/format";
import { AccessRequestCard } from "./AccessRequestCard";

export function AccessView() {
  const { accessRequests, pendingRequests, liveGrants, refresh, canPractise } =
    usePractitionerData();
  const history = accessRequests.filter(
    (request) => request.status !== "Pending" && request.status !== "Approved",
  );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Access requests"
        description="Every request you have sent, and the grants patients have open for you."
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

      {accessRequests.length === 0 && (
        <Card>
          <EmptyState
            title="No requests yet"
            description="Request access with a patient's passport id. They decide the category and the window before you can read anything."
            action={
              canPractise ? <LinkButton href="/access/new">Request access</LinkButton> : undefined
            }
          />
        </Card>
      )}

      {pendingRequests.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-rule">
            Waiting on the patient · {pendingRequests.length}
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-brand-amber/25 to-transparent"
            />
          </h2>
          {pendingRequests.map((request) => (
            <AccessRequestCard key={request.accessId} request={request} />
          ))}
        </section>
      )}

      {liveGrants.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-rule">
            Open grants · {liveGrants.length}
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-brand-green/25 to-transparent"
            />
          </h2>
          {liveGrants.map((request) => (
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
