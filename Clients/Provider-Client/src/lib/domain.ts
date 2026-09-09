import type { BadgeVariant } from "@/components/ui/Badge";

/**
 * The LockA domain model, mirroring the Soroban contract types in
 * `Smart-Contracts/`. Enum members use the contract's own variant names so
 * values can be passed straight through once contract bindings are generated.
 */

// ── Enums ─────────────────────────────────────────────────────────────────

/** `patient-passport-registry::PassportStatus` */
export type PassportStatus = "Active" | "Suspended" | "Revoked";

/** `provider-registry::ProviderStatus` */
export type ProviderStatus = "Pending" | "Verified" | "Suspended" | "Revoked";

/** `provider-registry::ProviderType` */
export type ProviderType =
  | "Hospital"
  | "Clinic"
  | "Doctor"
  | "Laboratory"
  | "Pharmacy"
  | "InsuranceCompany"
  | "PublicHealthAgency";

/** `medical-record-registry::RecordStatus` */
export type RecordStatus = "Active" | "Amended" | "Revoked";

/** `medical-record-registry::RecordType` */
export type RecordType =
  | "LabResult"
  | "Prescription"
  | "Diagnosis"
  | "Vaccination"
  | "SurgeryReport"
  | "AllergyRecord"
  | "InsuranceRecord"
  | "MedicalSummary";

/** `consent-access-manager::RecordScope` */
export type RecordScope =
  | "AllRecords"
  | "LabResultsOnly"
  | "PrescriptionsOnly"
  | "VaccinationRecordsOnly"
  | "EmergencySummaryOnly"
  | "InsuranceDataOnly";

/**
 * Derived from the `approved` / `revoked` / `expires_at` fields on
 * `consent-access-manager::AccessRequest`, flattened into the one state a
 * patient actually needs to act on.
 */
export type AccessStatus = "Pending" | "Approved" | "Rejected" | "Revoked" | "Expired";

// ── Entities ──────────────────────────────────────────────────────────────

export interface Passport {
  /** `u64` id minted by the passport registry. */
  passportId: number;
  patientWalletAddress: string;
  /** `BytesN<32>` commitment to the patient's identity claims. */
  publicIdentityHash: string;
  createdAt: number;
  status: PassportStatus;
  recoveryAddress: string | null;
}

export interface Provider {
  /** Providers are addressed by their Stellar account in the contracts. */
  providerId: string;
  name: string;
  providerType: ProviderType;
  country: string;
  licenseHash: string;
  status: ProviderStatus;
  registeredAt: number;
}

export interface MedicalRecord {
  /** `BytesN<32>` record id. */
  recordId: string;
  passportId: number;
  providerId: string;
  providerName: string;
  recordType: RecordType;
  title: string;
  /** Hash of the encrypted document held in the off-chain vault. */
  encryptedFileHash: string;
  /** Hash of the storage pointer (IPFS CID or object key). */
  storagePointerHash: string;
  status: RecordStatus;
  issuedAt: number;
}

export interface AccessRequest {
  /** `u64` id minted by the consent manager. */
  accessId: number;
  passportId: number;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  recordScope: RecordScope;
  /** Access window the provider asked for, in seconds. */
  durationSeconds: number;
  /** Free-text reason the provider gave for the request. */
  purpose: string;
  status: AccessStatus;
  requestedAt: number;
  /** Unix seconds. `0` until the request is approved. */
  expiresAt: number;
}

export type AuditEventKind =
  | "PassportCreated"
  | "RecoveryUpdated"
  | "ProviderRegistered"
  | "ProviderVerified"
  | "AccessRequested"
  | "AccessApproved"
  | "AccessRejected"
  | "AccessRevoked"
  | "AccessExpired"
  | "RecordAdded"
  | "RecordAmended"
  | "RecordRevoked";

export interface AuditEvent {
  id: string;
  kind: AuditEventKind;
  /** Who caused the event: a provider name, or "You" for patient actions. */
  actor: string;
  summary: string;
  /** Stellar transaction that carried the event. */
  txHash: string;
  at: number;
}

// ── Labels ────────────────────────────────────────────────────────────────

export const PASSPORT_STATUS_LABELS: Record<PassportStatus, string> = {
  Active: "Active",
  Suspended: "Suspended",
  Revoked: "Revoked",
};

export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  Pending: "Pending verification",
  Verified: "Verified",
  Suspended: "Suspended",
  Revoked: "Revoked",
};

export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  Hospital: "Hospital",
  Clinic: "Clinic",
  Doctor: "Doctor",
  Laboratory: "Laboratory",
  Pharmacy: "Pharmacy",
  InsuranceCompany: "Insurance company",
  PublicHealthAgency: "Public health agency",
};

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  Active: "Active",
  Amended: "Amended",
  Revoked: "Revoked",
};

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  LabResult: "Lab result",
  Prescription: "Prescription",
  Diagnosis: "Diagnosis",
  Vaccination: "Vaccination",
  SurgeryReport: "Surgery report",
  AllergyRecord: "Allergy record",
  InsuranceRecord: "Insurance record",
  MedicalSummary: "Medical summary",
};

export const RECORD_SCOPE_LABELS: Record<RecordScope, string> = {
  AllRecords: "All records",
  LabResultsOnly: "Lab results only",
  PrescriptionsOnly: "Prescriptions only",
  VaccinationRecordsOnly: "Vaccination records only",
  EmergencySummaryOnly: "Emergency summary only",
  InsuranceDataOnly: "Insurance data only",
};

export const ACCESS_STATUS_LABELS: Record<AccessStatus, string> = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  Revoked: "Revoked",
  Expired: "Expired",
};

/** What each scope actually exposes, shown to the patient before they consent. */
export const RECORD_SCOPE_DESCRIPTIONS: Record<RecordScope, string> = {
  AllRecords: "Every record category held in your passport.",
  LabResultsOnly: "Laboratory and diagnostic results only.",
  PrescriptionsOnly: "Prescriptions and medication history only.",
  VaccinationRecordsOnly: "Vaccination records only.",
  EmergencySummaryOnly: "Blood type, allergies, and current medication only.",
  InsuranceDataOnly: "Insurance and billing credentials only.",
};

export const AUDIT_EVENT_LABELS: Record<AuditEventKind, string> = {
  PassportCreated: "Passport created",
  RecoveryUpdated: "Recovery address updated",
  ProviderRegistered: "Provider registered",
  ProviderVerified: "Provider verified",
  AccessRequested: "Access requested",
  AccessApproved: "Access approved",
  AccessRejected: "Access rejected",
  AccessRevoked: "Access revoked",
  AccessExpired: "Access expired",
  RecordAdded: "Record added",
  RecordAmended: "Record amended",
  RecordRevoked: "Record revoked",
};

// ── Option lists for form controls ────────────────────────────────────────

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export const PROVIDER_TYPE_OPTIONS = toOptions(PROVIDER_TYPE_LABELS);
export const RECORD_TYPE_OPTIONS = toOptions(RECORD_TYPE_LABELS);
export const RECORD_SCOPE_OPTIONS = toOptions(RECORD_SCOPE_LABELS);

// ── Badge mapping ─────────────────────────────────────────────────────────

export const PASSPORT_STATUS_VARIANTS: Record<PassportStatus, BadgeVariant> = {
  Active: "green",
  Suspended: "amber",
  Revoked: "red",
};

export const PROVIDER_STATUS_VARIANTS: Record<ProviderStatus, BadgeVariant> = {
  Pending: "amber",
  Verified: "green",
  Suspended: "amber",
  Revoked: "red",
};

export const RECORD_STATUS_VARIANTS: Record<RecordStatus, BadgeVariant> = {
  Active: "green",
  Amended: "cyan",
  Revoked: "red",
};

export const ACCESS_STATUS_VARIANTS: Record<AccessStatus, BadgeVariant> = {
  Pending: "amber",
  Approved: "green",
  Rejected: "red",
  Revoked: "gray",
  Expired: "gray",
};

/** A passport id is displayed with a `LP-` prefix so it reads as an identifier. */
export function formatPassportId(passportId: number): string {
  return `LP-${String(passportId).padStart(6, "0")}`;
}

/** Accepts either the raw `u64` or the displayed `LP-000000` form. */
export function parsePassportId(input: string): number | null {
  const digits = input.trim().replace(/^LP-/i, "");
  if (!/^\d{1,19}$/.test(digits)) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}
