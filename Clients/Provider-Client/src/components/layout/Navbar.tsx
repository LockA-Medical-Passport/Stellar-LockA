"use client";

import { useWallet } from "@/features/wallet/WalletContext";
import { Button } from "@/components/ui/Button";
import { networkLabel } from "@/lib/config";
import { shortAddress, stellarAccountUrl } from "@/lib/stellar";

export interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { address, connecting, connect, disconnect } = useWallet();

  return (
    <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded-md p-1.5 text-foreground/70 hover:bg-white/5 hover:text-foreground md:hidden"
      >
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path
            d="M3 5.5h14M3 10h14M3 14.5h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {address ? (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-navy-800/60 px-3 py-1.5">
              <span className="size-2 rounded-full bg-brand-green" aria-hidden="true" />
              <a
                href={stellarAccountUrl(address)}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-foreground/80 hover:text-locka-cyan"
              >
                {shortAddress(address)}
              </a>
              <span className="hidden text-xs text-foreground/40 sm:inline">{networkLabel}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button size="sm" loading={connecting} onClick={connect}>
            Connect wallet
          </Button>
        )}
      </div>
    </header>
  );
}
