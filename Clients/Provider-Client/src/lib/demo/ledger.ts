import { DEMO_PRACTITIONER_ADDRESS } from "@/features/wallet/adapter";
import type {
  AccessRequest,
  AuditEvent,
  AuditEventKind,
  MedicalRecord,
  PassportStatus,
  Practitioner,
  PractitionerRef,
} from "@/lib/domain";

/**
 * An in-memory stand-in for the Soroban contracts and the locka-api indexer.
 *
 * It exists so every screen in this client can be built, reviewed, and
 * demonstrated before Freighter signing and the Soroban RPC client land. State
 * lives for the lifetime of the browser tab and is deliberately not persisted:
 * a reload is the reset button.
 *
 * Timestamps are unix seconds, matching the ledger timestamps the contracts
 * store.
 */

const HOUR = 3600;
const DAY = 86400;

/** Deterministic 32-byte hex, so ids stay stable across renders. */
export function hash32(seed: string): string {
  let a = 0x811c9dc5;
  const bytes: string[] = [];
  for (let index = 0; index < 32; index += 1) {
    for (let charIndex = 0; charIndex < seed.length; charIndex += 1) {
      a ^= seed.charCodeAt(charIndex) + index * 131;
      a = Math.imul(a, 16777619) >>> 0;
    }
    bytes.push((a & 0xff).toString(16).padStart(2, "0"));
  }
  return `0x${bytes.join("")}`;
}

function txHash(seed: string): string {
  return hash32(`tx:${seed}`).slice(2);
}

/** Passports the sample network knows about, for the lookup screen. */
export const DEMO_PASSPORTS: { passportId: number; status: PassportStatus }[] = [
  { passportId: 10427, status: "Active" },
  { passportId: 10431, status: "Active" },
  { passportId: 10402, status: "Active" },
  { passportId: 10388, status: "Suspended" },
];

export interface DemoState {
  practitioner: Practitioner | null;
  accessRequests: AccessRequest[];
  records: MedicalRecord[];
  auditEvents: AuditEvent[];
  nextAccessId: number;
  nextPractitionerId: number;
}

let state: DemoState | null = null;

/** The stamp this practitioner puts on everything they issue. */
function refOf(practitioner: Practitioner): PractitionerRef {
  return {
    practitionerId: practitioner.practitionerId,
    fullName: practitioner.fullName,
    role: practitioner.role,
    organizationName: practitioner.organizationName,
  };
}

function seed(): DemoState {
  const now = Math.floor(Date.now() / 1000);

  const practitioner: Practitioner = {
    practitionerId: 142,
    walletAddress: DEMO_PRACTITIONER_ADDRESS,
    fullName: "Amara Chinelo Nwosu",
    role: "Doctor",
    licenseNumber: "MDCN/R/58214",
    licenseHash: hash32("license:MDCN/R/58214"),
    organizationName: "Lagos General Hospital",
    organizationType: "Hospital",
    country: "Nigeria",
    status: "Verified",
    registeredAt: now - 320 * DAY,
  };

  const issuedBy = refOf(practitioner);

  const accessRequests: AccessRequest[] = [
    {
      accessId: 5104,
      passportId: 10427,
      requestedBy: issuedBy,
      recordScope: "EmergencySummaryOnly",
      durationSeconds: 24 * HOUR,
      purpose: "Pre-operative assessment ahead of scheduled surgery on Thursday.",
      status: "Pending",
      requestedAt: now - 4 * HOUR,
      expiresAt: 0,
    },
    {
      accessId: 5101,
      passportId: 10431,
      requestedBy: issuedBy,
      recordScope: "AllRecords",
      durationSeconds: 7 * DAY,
      purpose: "Admitted through accident and emergency; full history needed.",
      status: "Approved",
      requestedAt: now - 2 * DAY,
      expiresAt: now + 5 * DAY,
    },
    {
      accessId: 5099,
      passportId: 10402,
      requestedBy: issuedBy,
      recordScope: "PrescriptionsOnly",
      durationSeconds: 24 * HOUR,
      purpose: "Reviewing current medication before a follow-up appointment.",
      status: "Approved",
      requestedAt: now - 10 * HOUR,
      expiresAt: now + 14 * HOUR,
    },
    {
      accessId: 5090,
      passportId: 10388,
      requestedBy: issuedBy,
      recordScope: "AllRecords",
      durationSeconds: 30 * DAY,
      purpose: "Chronic care programme enrolment.",
      status: "Rejected",
      requestedAt: now - 34 * DAY,
      expiresAt: 0,
    },
    {
      accessId: 5077,
      passportId: 10427,
      requestedBy: issuedBy,
      recordScope: "AllRecords",
      durationSeconds: 7 * DAY,
      purpose: "Day surgery admission and discharge planning.",
      status: "Revoked",
      requestedAt: now - 145 * DAY,
      expiresAt: now - 140 * DAY,
    },
  ];

  const records: MedicalRecord[] = [
    {
      recordId: hash32("record:penicillin-allergy"),
      passportId: 10427,
      issuedBy,
      recordType: "AllergyRecord",
      title: "Penicillin allergy — anaphylaxis risk",
      encryptedFileHash: hash32("file:penicillin-allergy"),
      storagePointerHash: hash32("pointer:penicillin-allergy"),
      status: "Active",
      issuedAt: now - 168 * DAY,
    },
    {
      recordId: hash32("record:yellow-fever"),
      passportId: 10427,
      issuedBy,
      recordType: "Vaccination",
      title: "Yellow fever vaccination",
      encryptedFileHash: hash32("file:yellow-fever"),
      storagePointerHash: hash32("pointer:yellow-fever"),
      status: "Active",
      issuedAt: now - 190 * DAY,
    },
    {
      recordId: hash32("record:discharge-summary"),
      passportId: 10427,
      issuedBy,
      recordType: "MedicalSummary",
      title: "Discharge summary — day surgery",
      encryptedFileHash: hash32("file:discharge-summary"),
      storagePointerHash: hash32("pointer:discharge-summary"),
      status: "Active",
      issuedAt: now - 142 * DAY,
    },
    {
      recordId: hash32("record:ae-triage"),
      passportId: 10431,
      issuedBy,
      recordType: "Diagnosis",
      title: "Accident and emergency triage note",
      encryptedFileHash: hash32("file:ae-triage"),
      storagePointerHash: hash32("pointer:ae-triage"),
      status: "Active",
      issuedAt: now - 2 * DAY,
    },
    {
      recordId: hash32("record:ae-triage-draft"),
      passportId: 10431,
      issuedBy,
      recordType: "Diagnosis",
      title: "Accident and emergency triage note (superseded)",
      encryptedFileHash: hash32("file:ae-triage-draft"),
      storagePointerHash: hash32("pointer:ae-triage-draft"),
      status: "Amended",
      issuedAt: now - 2 * DAY - 3 * HOUR,
    },
    {
      recordId: hash32("record:paracetamol"),
      passportId: 10402,
      issuedBy,
      recordType: "Prescription",
      title: "Paracetamol 1g, 5 days",
      encryptedFileHash: hash32("file:paracetamol"),
      storagePointerHash: hash32("pointer:paracetamol"),
      status: "Active",
      issuedAt: now - 9 * HOUR,
    },
  ];

  const who = practitioner.fullName;
  const auditEvents: AuditEvent[] = [
    event(
      "AccessRequested",
      who,
      "Requested emergency summary access for LP-010427",
      now - 4 * HOUR,
    ),
    event("RecordAdded", who, "Paracetamol prescription issued to LP-010402", now - 9 * HOUR),
    event(
      "AccessApproved",
      "LP-010402",
      "Patient approved 24 hours of prescription access",
      now - 10 * HOUR,
    ),
    event("AccessApproved", "LP-010431", "Patient approved 7 days of full access", now - 2 * DAY),
    event("RecordAmended", who, "Triage note superseded for LP-010431", now - 2 * DAY),
    event("AccessRejected", "LP-010388", "Patient rejected a full-access request", now - 34 * DAY),
    event(
      "AccessRevoked",
      "LP-010427",
      "Patient revoked full access after discharge",
      now - 140 * DAY,
    ),
    event(
      "PractitionerRegistered",
      who,
      "Registered as PR-000142 at Lagos General Hospital",
      now - 320 * DAY,
    ),
  ];

  return {
    practitioner,
    accessRequests,
    records,
    auditEvents,
    nextAccessId: 5105,
    nextPractitionerId: 143,
  };
}

function event(kind: AuditEventKind, actor: string, summary: string, at: number): AuditEvent {
  return { id: `${kind}-${at}`, kind, actor, summary, txHash: txHash(`${kind}-${at}`), at };
}

export function ledger(): DemoState {
  if (!state) state = seed();
  return state;
}

/** Appends an audit entry and returns the transaction hash the caller reports. */
export function recordEvent(kind: AuditEventKind, actor: string, summary: string): string {
  const at = Math.floor(Date.now() / 1000);
  const entry = event(kind, actor, summary, at);
  ledger().auditEvents = [entry, ...ledger().auditEvents];
  return entry.txHash;
}

export { refOf };
