"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card, InfoGrid, InfoRow } from "@/components/ui/Card";
import { CopyableValue } from "@/components/ui/CopyableValue";
import { PageHeader } from "@/components/ui/PageHeader";
import { useWallet } from "@/features/wallet/WalletContext";
import { config, networkLabel } from "@/lib/config";
import { shortAddress, shortHash, stellarContractUrl } from "@/lib/stellar";

const CONTRACTS = [
  {
    key: "patientPassportRegistry" as const,
    name: "PatientPassportRegistry",
    role: "Holds each patient passport id, identity commitment, and recovery account.",
  },
  {
    key: "providerRegistry" as const,
    name: "ProviderRegistry",
    role: "Holds your organisation's entry and its verification status.",
  },
  {
    key: "medicalRecordRegistry" as const,
    name: "MedicalRecordRegistry",
    role: "Anchors a hash per record you issue, so documents can be checked.",
  },
  {
    key: "consentAccessManager" as const,
    name: "ConsentAccessManager",
    role: "Stores each request you send, its scope, its window, and its revocation.",
  },
];

export function SettingsView() {
  const { address, connecting, connect, disconnect } = useWallet();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Settings"
        description="The network, the contracts, and the account this client is talking to."
      />

      {config.demoMode && (
        <Callout tone="warning" title="Sample data mode">
          Reads and writes go to an in-memory ledger, not to Stellar. Set
          <code className="mx-1 rounded bg-navy-800/80 px-1 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_DEMO_MODE=false
          </code>
          once wallet signing and the Soroban client are in place.
        </Callout>
      )}

      <Card title="Account">
        {address ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <InfoRow label="Connected account">
              <CopyableValue value={address} display={shortAddress(address)} />
            </InfoRow>
            <Button variant="secondary" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-foreground/60">No account connected.</p>
            <Button size="sm" loading={connecting} onClick={connect}>
              Connect wallet
            </Button>
          </div>
        )}
      </Card>

      <Card title="Network">
        <InfoGrid>
          <InfoRow label="Network">
            <span className="flex items-center gap-2">
              {networkLabel}
              <Badge variant="cyan" dot={false}>
                {config.demoMode ? "sample data" : "live"}
              </Badge>
            </span>
          </InfoRow>
          <InfoRow label="Soroban RPC">
            <span className="font-mono text-xs break-all text-foreground/80">
              {config.sorobanRpcUrl}
            </span>
          </InfoRow>
          <InfoRow label="Network passphrase">
            <span className="font-mono text-xs break-all text-foreground/80">
              {config.stellarNetworkPassphrase}
            </span>
          </InfoRow>
          <InfoRow label="locka-api">
            <span className="font-mono text-xs break-all text-foreground/80">
              {config.lockaApiUrl || "not configured"}
            </span>
          </InfoRow>
        </InfoGrid>
      </Card>

      <Card title="Contracts">
        <ul className="divide-y divide-white/5">
          {CONTRACTS.map((contract) => {
            const contractId = config.contracts[contract.key];
            return (
              <li key={contract.key} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-foreground">{contract.name}</p>
                    <p className="mt-0.5 text-xs text-foreground/50">{contract.role}</p>
                  </div>
                  {contractId ? (
                    <a
                      href={stellarContractUrl(contractId)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 font-mono text-xs text-locka-cyan hover:underline"
                    >
                      {shortHash(contractId)}
                    </a>
                  ) : (
                    <Badge variant="amber">not deployed</Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
