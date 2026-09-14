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

/**
 * The clinical role of the individual holding the registration.
 *
 * A LockA provider is a person, not a building: the doctor who wrote the note,
 * the pharmacist who dispensed the drug, the scientist who ran the assay. The
 * organisation they work under is recorded separately, as `OrganizationType`.
 *
 * `provider-registry` currently carries a single `ProviderType` enum that mixes
 * individuals and institutions. Splitting it into these two is the contract
 * change this model expects.
 */
export type PractitionerRole =
  | "Doctor"
  | "Nurse"
  | "Midwife"
  | "Pharmacist"
  | "LaboratoryScientist"
  | "Radiographer"
  | "Physiotherapist"
  | "Dentist";

/** The kind of organisation a practitioner practises under. */
export type OrganizationType =
  | "Hospital"
  | "Clinic"
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

/**
 * A registered individual practitioner.
 *
 * The registry mints `practitionerId` from the details submitted at
 * registration, and that id is what gets stamped on everything the practitioner
 * issues. The identifying details themselves stay off-chain with locka-api,
 * under the platform's rule that no personally identifiable information is
 * written to a public ledger: the chain holds the id, the licence commitment,
 * and the status.
 */
export interface Practitioner {
  /** `u64` id minted by the provider registry, linked to the details below. */
  practitionerId: number;
  /** Stellar account holding the registration and signing its writes. */
  walletAddress: string;
  /** Full government name, as it appears on the practising licence. */
  fullName: string;
  role: PractitionerRole;
  /** Licence number, checkable against the issuing council's register. */
  licenseNumber: string;
  /** `BytesN<32>` commitment to the licence number, anchored on-chain. */
  licenseHash: string;
  /** The hospital, clinic, laboratory, or pharmacy they practise under. */
  organizationName: string;
  organizationType: OrganizationType;
  country: string;
  status: ProviderStatus;
  registeredAt: number;
}

/**
 * The practitioner stamp carried by everything issued to a patient.
 *
 * A record or a request without one cannot be traced back to a person, so this
 * travels with both. It is a snapshot taken at issue time, which is what keeps
 * a record attributable to who signed it even after they move organisation.
 */
export interface PractitionerRef {
  practitionerId: number;
  fullName: string;
  role: PractitionerRole;
  organizationName: string;
}

export interface MedicalRecord {
  /** `BytesN<32>` record id. */
  recordId: string;
  passportId: number;
  /** The practitioner who issued it, stamped at issue time. */
  issuedBy: PractitionerRef;
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
  /** The practitioner asking, so the patient knows who they are consenting to. */
  requestedBy: PractitionerRef;
  recordScope: RecordScope;
  /** Access window the practitioner asked for, in seconds. */
  durationSeconds: number;
  /** Free-text reason the practitioner gave for the request. */
  purpose: string;
  status: AccessStatus;
  requestedAt: number;
  /** Unix seconds. `0` until the request is approved. */
  expiresAt: number;
}

export type AuditEventKind =
  | "PassportCreated"
  | "RecoveryUpdated"
  | "PractitionerRegistered"
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
  /** Who caused the event: a practitioner, or "You" for the account's own actions. */
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
  Pending: "Pending review",
  Verified: "Registered",
  Suspended: "Suspended",
  Revoked: "Revoked",
};

export const PRACTITIONER_ROLE_LABELS: Record<PractitionerRole, string> = {
  Doctor: "Doctor",
  Nurse: "Nurse",
  Midwife: "Midwife",
  Pharmacist: "Pharmacist",
  LaboratoryScientist: "Laboratory scientist",
  Radiographer: "Radiographer",
  Physiotherapist: "Physiotherapist",
  Dentist: "Dentist",
};

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  Hospital: "Hospital",
  Clinic: "Clinic",
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
  PractitionerRegistered: "Practitioner registered",
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

export const PRACTITIONER_ROLE_OPTIONS = toOptions(PRACTITIONER_ROLE_LABELS);
export const ORGANIZATION_TYPE_OPTIONS = toOptions(ORGANIZATION_TYPE_LABELS);
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

// ── Identifier formatting ─────────────────────────────────────────────────

/** A passport id is displayed with an `LP-` prefix so it reads as an identifier. */
export function formatPassportId(passportId: number): string {
  return `LP-${String(passportId).padStart(6, "0")}`;
}

/** Accepts either the raw `u64` or the displayed `LP-000000` form. */
export function parsePassportId(input: string): number | null {
  return parsePrefixedId(input, "LP");
}

/**
 * The practitioner id the registry mints at registration. It is stamped on every
 * record and every access request, so a patient can always trace a result back
 * to the person who issued it.
 */
export function formatPractitionerId(practitionerId: number): string {
  return `PR-${String(practitionerId).padStart(6, "0")}`;
}

/** Accepts either the raw `u64` or the displayed `PR-000000` form. */
export function parsePractitionerId(input: string): number | null {
  return parsePrefixedId(input, "PR");
}

function parsePrefixedId(input: string, prefix: string): number | null {
  const digits = input.trim().replace(new RegExp(`^${prefix}-`, "i"), "");
  if (!/^\d{1,19}$/.test(digits)) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}

/** "Dr Amara Nwosu · PR-000142 · Lagos General Hospital" */
export function describePractitioner(ref: PractitionerRef): string {
  return `${ref.fullName} · ${formatPractitionerId(ref.practitionerId)} · ${ref.organizationName}`;
}
