"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "@/components/ui/toast-store";
import { clearPractitioner, loadPractitioner } from "@/features/practitioner/practitioner-store";
import { errorMessage } from "@/lib/utils";
import { walletAdapter } from "./adapter";

export interface WalletState {
  /** Stellar account address of the connected wallet, or null. */
  address: string | null;
  /** True until the stored session has been checked on first mount. */
  restoring: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

/**
 * Owns the connected account and, with it, the practitioner read.
 *
 * An account appearing is the event that makes practitioner data fetchable, so the
 * load is kicked off from here rather than from a render effect in every screen.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    walletAdapter
      .restore()
      .then((restored) => {
        if (cancelled) return;
        if (restored) void loadPractitioner(restored);
        setAddress(restored);
      })
      .catch(() => {
        // A failed restore is indistinguishable from "never connected".
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const connected = await walletAdapter.connect();
      void loadPractitioner(connected);
      setAddress(connected);
    } catch (error) {
      toast.error(errorMessage(error), { title: "Could not connect wallet" });
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await walletAdapter.disconnect();
    clearPractitioner();
    setAddress(null);
  }, []);

  const value = useMemo<WalletState>(
    () => ({ address, restoring, connecting, connect, disconnect }),
    [address, restoring, connecting, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside a WalletProvider");
  }
  return context;
}
