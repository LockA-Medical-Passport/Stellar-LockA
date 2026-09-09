"use client";

import { type ReactNode } from "react";
import { Callout } from "@/components/ui/Callout";
import { LinkButton } from "@/components/ui/LinkButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConnectPrompt } from "@/features/wallet/ConnectPrompt";
import { useWallet } from "@/features/wallet/WalletContext";
import { useProviderData } from "./useProviderData";

export interface ProviderGateProps {
  children: ReactNode;
  /**
   * Screens that write to a patient's passport need a verified provider, not
   * just a registered one.
   */
  requireVerified?: boolean;
}

/**
 * Wraps the screens that need a wallet and a registered organisation, so each
 * page can assume `provider` is present rather than repeating the empty states.
 */
export function ProviderGate({ children, requireVerified = false }: ProviderGateProps) {
  const { address } = useWallet();
  const { loading, error, provider, isVerified } = useProviderData();

  if (loading) return <LoadingPanel />;
  if (!address) return <ConnectPrompt />;

  if (error) {
    return (
      <Callout tone="danger" title="Could not read your organisation">
        {error}
      </Callout>
    );
  }

  if (!provider) return <NotRegisteredPrompt />;

  if (requireVerified && !isVerified) {
    return (
      <div className="space-y-4">
        <Callout tone="warning" title="Awaiting verification">
          An administrator has to verify {provider.name} before it can request patient access or
          write records. Your registration is on the network and in the review queue.
        </Callout>
        <LinkButton href="/profile" variant="secondary">
          View organisation profile
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
          <rect x="3.75" y="2.75" width="11.5" height="18.5" rx="2" />
          <path d="M15.25 8.5h5v12.75h-5" />
          <path d="M7 6.75h1M11 6.75h1M7 10.75h1M11 10.75h1M7 14.75h1M11 14.75h1" />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-foreground">
        This account is not a registered provider
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-foreground/60">
        Register your hospital, clinic, laboratory, pharmacy, or insurance organisation. An
        administrator reviews the submission before you can request patient access.
      </p>
      <LinkButton href="/profile/register" className="mt-6">
        Register organisation
      </LinkButton>
    </div>
  );
}
