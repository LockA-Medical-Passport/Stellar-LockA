import { config } from "@/lib/config";

/**
 * The single seam between the UI and a Stellar wallet.
 *
 * Freighter signing is not wired up yet. Until it is, `demoAdapter` hands the
 * UI a fixed testnet address so every screen is reachable, and
 * `freighterAdapter` is the shape to fill in with `@stellar/freighter-api`:
 *
 *   import { isConnected, requestAccess, getAddress, getNetwork }
 *     from "@stellar/freighter-api";
 *
 * Nothing else in the app talks to a wallet directly, so swapping the export at
 * the bottom of this file is the whole integration on the client side.
 */

export interface WalletAdapter {
  readonly id: "demo" | "freighter";
  /** Whether the wallet can be used in this browser at all. */
  isAvailable(): Promise<boolean>;
  /** Prompts for access. Resolves to the account address. */
  connect(): Promise<string>;
  /** Address of an already-authorised account, or null. */
  restore(): Promise<string | null>;
  disconnect(): Promise<void>;
}

const STORAGE_KEY = "locka.provider.wallet";

/**
 * A testnet account used to populate the sample ledger.
 *
 * In the contracts a provider is addressed by its Stellar account, so this
 * doubles as the demo provider's id.
 */
export const DEMO_PROVIDER_ADDRESS = "GCHOSPITALLAGOSGENERALPIQJRKSLTMUNVOWPXQYRZS2T3U4V5W6X7Y";

const demoAdapter: WalletAdapter = {
  id: "demo",

  async isAvailable() {
    return true;
  },

  async connect() {
    // Stands in for the wallet's approval prompt.
    await new Promise((resolve) => setTimeout(resolve, 400));
    window.localStorage.setItem(STORAGE_KEY, DEMO_PROVIDER_ADDRESS);
    return DEMO_PROVIDER_ADDRESS;
  },

  async restore() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },

  async disconnect() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage is unavailable; the in-memory session is cleared regardless.
    }
  },
};

const freighterAdapter: WalletAdapter = {
  id: "freighter",

  async isAvailable() {
    return false;
  },

  async connect(): Promise<string> {
    throw new Error(
      "Freighter is not wired up yet. Set NEXT_PUBLIC_DEMO_MODE=true, or implement freighterAdapter in features/wallet/adapter.ts.",
    );
  },

  async restore() {
    return null;
  },

  async disconnect() {},
};

export const walletAdapter: WalletAdapter = config.demoMode ? demoAdapter : freighterAdapter;
