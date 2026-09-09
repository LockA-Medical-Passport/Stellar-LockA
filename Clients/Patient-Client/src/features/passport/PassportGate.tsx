"use client";

import { type ReactNode } from "react";
import { Callout } from "@/components/ui/Callout";
import { LinkButton } from "@/components/ui/LinkButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConnectPrompt } from "@/features/wallet/ConnectPrompt";
import { useWallet } from "@/features/wallet/WalletContext";
import { usePassportData } from "./usePassportData";

/**
 * Wraps the screens that need a wallet and a registered passport, so each page
 * can assume `passport` is present rather than repeating the empty states.
 */
export function PassportGate({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const { loading, error, passport } = usePassportData();

  if (loading) return <LoadingPanel />;
  if (!address) return <ConnectPrompt />;

  if (error) {
    return (
      <Callout tone="danger" title="Could not read your passport">
        {error}
      </Callout>
    );
  }

  if (!passport) return <NoPassportPrompt />;

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

export function NoPassportPrompt() {
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
          <rect x="4.75" y="2.75" width="14.5" height="18.5" rx="2.5" />
          <circle cx="12" cy="9.5" r="2.75" />
          <path d="M8.25 16.5h7.5" />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-foreground">No passport on this account</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-foreground/60">
        This wallet has no medical passport yet. Creating one registers an identity commitment on
        Stellar. No medical detail is written on-chain.
      </p>
      <LinkButton href="/passport/create" className="mt-6">
        Create my passport
      </LinkButton>
    </div>
  );
}
