"use client";

import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { Card, InfoGrid, InfoRow } from "@/components/ui/Card";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { PageHeader } from "@/components/ui/PageHeader";
import { networkLabel } from "@/lib/config";
import {
  ORGANIZATION_TYPE_LABELS,
  PRACTITIONER_ROLE_LABELS,
  PROVIDER_STATUS_LABELS,
  PROVIDER_STATUS_VARIANTS,
  formatPractitionerId,
  type Practitioner,
} from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import { shortAddress, shortHash } from "@/lib/stellar";

const RULES = [
  "Your practitioner id is stamped on every record you issue, so a patient can always trace a result back to you.",
  "A patient sees your name, role, organisation, and stated purpose before deciding on a request.",
  "A grant covers one record category and one time window, and the patient can end it early.",
  "Your full name and licence number stay off-chain with locka-api. The ledger holds your id, your licence commitment, and your status.",
];

export function PractitionerProfile({ practitioner }: { practitioner: Practitioner }) {
  const blocked = practitioner.status === "Suspended" || practitioner.status === "Revoked";

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="My registration"
        description="Who you are on the network, and the id stamped on everything you issue."
      />

      {blocked && (
        <Callout
          tone="danger"
          title={`Registration ${PROVIDER_STATUS_LABELS[practitioner.status].toLowerCase()}`}
        >
          You cannot request patient access or issue records. Contact a LockA administrator to
          resolve it.
        </Callout>
      )}

      <Card title="Practitioner id">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-2xl font-bold text-locka-cyan">
              {formatPractitionerId(practitioner.practitionerId)}
            </p>
            <p className="mt-1 text-sm text-foreground/60">
              Minted by the provider registry from the details below, and appended to every record
              and access request you send.
            </p>
          </div>
          <CopyableValue
            value={formatPractitionerId(practitioner.practitionerId)}
            display="Copy id"
          />
        </div>
      </Card>

      <Card title="Registry entry">
        <InfoGrid>
          <InfoRow label="Full name">
            <span className="text-sm font-medium text-foreground">{practitioner.fullName}</span>
          </InfoRow>
          <InfoRow label="Status">
            <Badge variant={PROVIDER_STATUS_VARIANTS[practitioner.status]}>
              {PROVIDER_STATUS_LABELS[practitioner.status]}
            </Badge>
          </InfoRow>
          <InfoRow label="Role">{PRACTITIONER_ROLE_LABELS[practitioner.role]}</InfoRow>
          <InfoRow label="Licence number">
            <span className="font-mono text-xs text-foreground/85">
              {practitioner.licenseNumber}
            </span>
          </InfoRow>
          <InfoRow label="Organisation">
            {practitioner.organizationName}
            <p className="mt-0.5 text-xs text-foreground/45">
              {ORGANIZATION_TYPE_LABELS[practitioner.organizationType]}
            </p>
          </InfoRow>
          <InfoRow label="Country">{practitioner.country}</InfoRow>
          <InfoRow label="Signing account">
            <CopyableValue
              value={practitioner.walletAddress}
              display={shortAddress(practitioner.walletAddress)}
            />
          </InfoRow>
          <InfoRow label="Licence commitment">
            <CopyableValue
              value={practitioner.licenseHash}
              display={shortHash(practitioner.licenseHash)}
            />
          </InfoRow>
          <InfoRow label="Registered">{formatDateTime(practitioner.registeredAt)}</InfoRow>
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
