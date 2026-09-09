"use client";

import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { Card, InfoGrid, InfoRow } from "@/components/ui/Card";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { PageHeader } from "@/components/ui/PageHeader";
import { networkLabel } from "@/lib/config";
import {
  PROVIDER_STATUS_LABELS,
  PROVIDER_STATUS_VARIANTS,
  PROVIDER_TYPE_LABELS,
  type Provider,
} from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import { shortAddress, shortHash } from "@/lib/stellar";

const RULES = [
  "Only a verified provider can request patient access or write a record.",
  "A patient sees your name, category, and stated purpose before deciding.",
  "A grant covers one record category and one time window, and the patient can end it early.",
  "Every request, grant, and record you write is logged against your account.",
];

export function ProviderProfile({ provider }: { provider: Provider }) {
  const pending = provider.status === "Pending";
  const blocked = provider.status === "Suspended" || provider.status === "Revoked";

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Organisation"
        description="How your organisation appears to patients, and what the registry holds for it."
      />

      {pending && (
        <Callout tone="warning" title="Awaiting verification">
          {provider.name} is registered and in the administrator review queue. Requesting access and
          writing records unlock once verification lands.
        </Callout>
      )}

      {blocked && (
        <Callout tone="danger" title={`Registration ${provider.status.toLowerCase()}`}>
          This organisation cannot request access or write records. Contact a LockA administrator to
          resolve it.
        </Callout>
      )}

      <Card title="Registry entry">
        <InfoGrid>
          <InfoRow label="Name">
            <span className="text-sm font-medium text-foreground">{provider.name}</span>
          </InfoRow>
          <InfoRow label="Status">
            <Badge variant={PROVIDER_STATUS_VARIANTS[provider.status]}>
              {PROVIDER_STATUS_LABELS[provider.status]}
            </Badge>
          </InfoRow>
          <InfoRow label="Category">{PROVIDER_TYPE_LABELS[provider.providerType]}</InfoRow>
          <InfoRow label="Country">{provider.country}</InfoRow>
          <InfoRow label="Provider account">
            <CopyableValue
              value={provider.providerId}
              display={shortAddress(provider.providerId)}
            />
          </InfoRow>
          <InfoRow label="Licence commitment">
            <CopyableValue value={provider.licenseHash} display={shortHash(provider.licenseHash)} />
          </InfoRow>
          <InfoRow label="Registered">{formatDateTime(provider.registeredAt)}</InfoRow>
          <InfoRow label="Network">{networkLabel}</InfoRow>
        </InfoGrid>
      </Card>

      <Card title="What patients are promised">
        <ul className="space-y-2">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-2 text-sm text-foreground/60">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-locka-cyan"
                aria-hidden="true"
              />
              {rule}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
