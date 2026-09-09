"use client";

import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { Card, InfoGrid, InfoRow } from "@/components/ui/Card";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { PageHeader } from "@/components/ui/PageHeader";
import { networkLabel } from "@/lib/config";
import {
  PASSPORT_STATUS_LABELS,
  PASSPORT_STATUS_VARIANTS,
  formatPassportId,
  type Passport,
} from "@/lib/domain";
import { formatDateTime } from "@/lib/format";
import { shortAddress, shortHash } from "@/lib/stellar";
import { RecoveryAddressForm } from "./RecoveryAddressForm";

const ON_CHAIN = [
  "Your passport id and the Stellar account that holds it",
  "A commitment to your identity claims, which reveals nothing on its own",
  "Which provider may read which record category, and until when",
  "A hash per record, so a document can be checked against what was issued",
  "An event for every request, approval, rejection, and revocation",
];

const OFF_CHAIN = [
  "Diagnoses, prescriptions, lab results, and clinical notes",
  "Identity documents and contact details",
  "Uploaded files and imaging, encrypted in the health vault",
];

export function PassportDetail({ passport }: { passport: Passport }) {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="My passport"
        description="The identity your records hang off, and the account that can recover it."
      />

      {!passport.recoveryAddress && (
        <Callout tone="warning" title="No recovery account set">
          If you lose access to this wallet, there is no way back into your passport. Set a recovery
          account below.
        </Callout>
      )}

      <Card title="Passport details">
        <InfoGrid>
          <InfoRow label="Passport id">
            <CopyableValue
              value={String(passport.passportId)}
              display={formatPassportId(passport.passportId)}
            />
          </InfoRow>
          <InfoRow label="Status">
            <Badge variant={PASSPORT_STATUS_VARIANTS[passport.status]}>
              {PASSPORT_STATUS_LABELS[passport.status]}
            </Badge>
          </InfoRow>
          <InfoRow label="Holding account">
            <CopyableValue
              value={passport.patientWalletAddress}
              display={shortAddress(passport.patientWalletAddress)}
            />
          </InfoRow>
          <InfoRow label="Identity commitment">
            <CopyableValue
              value={passport.publicIdentityHash}
              display={shortHash(passport.publicIdentityHash)}
            />
          </InfoRow>
          <InfoRow label="Created">{formatDateTime(passport.createdAt)}</InfoRow>
          <InfoRow label="Network">{networkLabel}</InfoRow>
        </InfoGrid>
      </Card>

      <Card title="Recovery account">
        {passport.recoveryAddress && (
          <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-foreground/70">
            Currently set to
            <CopyableValue
              value={passport.recoveryAddress}
              display={shortAddress(passport.recoveryAddress)}
            />
          </p>
        )}
        <RecoveryAddressForm passportId={passport.passportId} current={passport.recoveryAddress} />
      </Card>

      <Card title="What is on the network, and what is not">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">On Stellar</h3>
            <ul className="space-y-1.5">
              {ON_CHAIN.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-foreground/60">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-locka-cyan"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Never on Stellar</h3>
            <ul className="space-y-1.5">
              {OFF_CHAIN.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-foreground/60">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-green"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
