"use client";

import { Button } from "@/components/ui/Button";
import { useWallet } from "./WalletContext";

export interface ConnectPromptProps {
  title?: string;
  description?: string;
}

/** Shown wherever a screen needs a connected wallet before it can read anything. */
export function ConnectPrompt({
  title = "Connect your wallet",
  description = "Your passport is held under your Stellar account. Connect it to read your records and manage who can see them.",
}: ConnectPromptProps) {
  const { connecting, connect } = useWallet();

  return (
    <div className="glass glow-blue rounded-2xl px-6 py-12 text-center">
      <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-brand-blue/30 bg-brand-blue/10">
        <svg
          viewBox="0 0 24 24"
          className="size-8 text-brand-blue"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2.75" y="6" width="18.5" height="12.5" rx="2.5" />
          <path d="M2.75 10.5h18.5" />
          <circle cx="17" cy="14.5" r="1.25" />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-foreground/60">{description}</p>
      <Button className="mt-6" loading={connecting} onClick={connect}>
        Connect wallet
      </Button>
    </div>
  );
}
