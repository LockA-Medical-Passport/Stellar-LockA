/**
 * Client configuration, read from `NEXT_PUBLIC_*` environment variables.
 *
 * Every value has a Stellar testnet default so the app runs immediately after
 * `npm install` with no `.env.local`. Copy `.env.example` to `.env.local` to
 * point the client at your own backend or your own deployed contracts.
 */

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
export const PUBLIC_PASSPHRASE = "Public Global Stellar Network ; September 2015";

export const config = {
  /** Base URL of the locka-api backend. */
  lockaApiUrl: process.env.NEXT_PUBLIC_LOCKA_API_URL ?? "",

  /** Stellar network passphrase this client signs and submits against. */
  stellarNetworkPassphrase: env("NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE", TESTNET_PASSPHRASE),

  /** Soroban RPC endpoint used to simulate and submit contract invocations. */
  sorobanRpcUrl: env("NEXT_PUBLIC_SOROBAN_RPC_URL", "https://soroban-testnet.stellar.org"),

  /** Deployed Soroban contract IDs. Empty until the contracts are deployed. */
  contracts: {
    patientPassportRegistry: process.env.NEXT_PUBLIC_PATIENT_PASSPORT_REGISTRY_CONTRACT_ID ?? "",
    providerRegistry: process.env.NEXT_PUBLIC_PROVIDER_REGISTRY_CONTRACT_ID ?? "",
    medicalRecordRegistry: process.env.NEXT_PUBLIC_MEDICAL_RECORD_REGISTRY_CONTRACT_ID ?? "",
    consentAccessManager: process.env.NEXT_PUBLIC_CONSENT_ACCESS_MANAGER_CONTRACT_ID ?? "",
  },

  /**
   * Serves the UI from the in-memory sample ledger in `lib/demo` instead of a
   * live network. Stays on until Freighter signing and the Soroban client are
   * wired up.
   */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
} as const;

export const isTestnet = config.stellarNetworkPassphrase === TESTNET_PASSPHRASE;

export const networkLabel = isTestnet
  ? "Stellar Testnet"
  : config.stellarNetworkPassphrase === PUBLIC_PASSPHRASE
    ? "Stellar Mainnet"
    : "Custom Stellar network";
