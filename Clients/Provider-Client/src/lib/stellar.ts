import { config, isTestnet } from "./config";

/**
 * Stellar/Soroban value helpers.
 *
 * Kept dependency-free on purpose: validation and formatting here mirror what
 * `@stellar/stellar-sdk` enforces, so the UI can check input shape long before
 * wallet signing is wired up.
 */

/** Stellar ed25519 account address, e.g. `GBZX…`. 56 base32 characters. */
const ACCOUNT_ADDRESS = /^G[A-Z2-7]{55}$/;

/** Soroban contract address, e.g. `CDLZ…`. 56 base32 characters. */
const CONTRACT_ADDRESS = /^C[A-Z2-7]{55}$/;

/** A `BytesN<32>` value rendered as hex, with or without the `0x` prefix. */
const HASH_32 = /^(0x)?[0-9a-fA-F]{64}$/;

export function isStellarAddress(value: string): boolean {
  return ACCOUNT_ADDRESS.test(value.trim());
}

export function isContractAddress(value: string): boolean {
  return CONTRACT_ADDRESS.test(value.trim());
}

export function isHash32(value: string): boolean {
  return HASH_32.test(value.trim());
}

/** Normalises a 32-byte hash to the lowercase `0x…` form the contracts index by. */
export function normalizeHash32(value: string): string {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
}

/** A passport or access id is a `u64` counter in the Soroban contracts. */
export function isEntityId(value: string): boolean {
  return /^\d{1,19}$/.test(value.trim());
}

/**
 * Derives a 32-byte hex commitment from arbitrary input using SubtleCrypto.
 *
 * The contracts store a commitment, never the underlying document. Hashing in
 * the browser means the plaintext identity or licence value never leaves the
 * device.
 */
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}

const EXPLORER_BASE = isTestnet
  ? "https://stellar.expert/explorer/testnet"
  : "https://stellar.expert/explorer/public";

export function stellarTxUrl(txHash: string): string {
  return `${EXPLORER_BASE}/tx/${txHash}`;
}

export function stellarAccountUrl(address: string): string {
  return `${EXPLORER_BASE}/account/${address}`;
}

export function stellarContractUrl(contractId: string): string {
  return `${EXPLORER_BASE}/contract/${contractId}`;
}

export function shortTxHash(txHash: string): string {
  return txHash.length > 16 ? `${txHash.slice(0, 8)}…${txHash.slice(-6)}` : txHash;
}

/** `GBZX…4KQM` — enough of a Stellar address to recognise it at a glance. */
export function shortAddress(address: string | null | undefined): string {
  if (!address) return "—";
  return address.length > 14 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address;
}

/** `0x8f21c4d3…9ab120` — same idea for `BytesN<32>` commitments. */
export function shortHash(hash: string | null | undefined): string {
  if (!hash) return "—";
  return hash.length > 20 ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : hash;
}

export const rpcEndpoint = config.sorobanRpcUrl;
