"use client";

import { type ReactNode } from "react";
import { Callout } from "@/components/ui/Callout";
import { LinkButton } from "@/components/ui/LinkButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConnectPrompt } from "@/features/wallet/ConnectPrompt";
import { useWallet } from "@/features/wallet/WalletContext";
import { PROVIDER_STATUS_LABELS } from "@/lib/domain";
import { usePractitionerData } from "./usePractitionerData";

export interface PractitionerGateProps {
  children: ReactNode;
  /**
   * Screens that touch a patient's passport need a registration in good
   * standing, not merely one that exists.
   */
  requirePractising?: boolean;
}

/**
 * Wraps the screens that need a wallet and a registered practitioner, so each
 * page can assume `practitioner` is present rather than repeating the empty
 * states.
 */
export function PractitionerGate({ children, requirePractising = false }: PractitionerGateProps) {
  const { address } = useWallet();
  const { loading, error, practitioner, canPractise } = usePractitionerData();

  if (loading) return <LoadingPanel />;
  if (!address) return <ConnectPrompt />;

  if (error) {
    return (
      <Callout tone="danger" title="Could not read your registration">
        {error}
      </Callout>
    );
  }

  if (!practitioner) return <NotRegisteredPrompt />;

  if (requirePractising && !canPractise) {
    return (
      <div className="space-y-4">
        <Callout
          tone="danger"
          title={`Registration ${PROVIDER_STATUS_LABELS[practitioner.status].toLowerCase()}`}
        >
          This registration cannot request patient access or issue records. Contact a LockA
          administrator to resolve it.
        </Callout>
        <LinkButton href="/profile" variant="secondary">
          View my registration
        </LinkButton>
      </div>
    );
  }

  return <>{children}</>;
}

export function LoadingPanel() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function NotRegisteredPrompt() {
  return (
    <div className="glass rounded-2xl px-6 py-12 text-center">
      <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-locka-cyan/30 bg-locka-cyan/10">
        <svg
          viewBox="0 0 24 24"
          className="size-8 text-locka-cyan"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-foreground">
        This account holds no practitioner registration
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-foreground/60">
        Register as an individual practitioner: a doctor, nurse, midwife, pharmacist, laboratory
        scientist, radiographer, physiotherapist, or dentist. The registry mints your practitioner
        id, and that id is stamped on every result you issue.
      </p>
      <LinkButton href="/profile/register" className="mt-6">
        Register as a practitioner
      </LinkButton>
    </div>
  );
}
