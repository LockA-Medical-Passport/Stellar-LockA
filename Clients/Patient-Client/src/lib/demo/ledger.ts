import type {
  AccessRequest,
  AuditEvent,
  AuditEventKind,
  MedicalRecord,
  Passport,
  PractitionerRef,
} from "@/lib/domain";
import { DEMO_PATIENT_ADDRESS } from "@/features/wallet/adapter";

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
function hash32(seed: string): string {
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

/**
 * The practitioners in the sample data.
 *
 * A LockA provider is a person, not an institution: each entry is an individual
 * with their own registry-minted id, practising under a named organisation.
 */
export const DEMO_PRACTITIONERS = {
  surgeon: {
    practitionerId: 142,
    fullName: "Amara Chinelo Nwosu",
    role: "Doctor",
    organizationName: "Lagos General Hospital",
  },
  labScientist: {
    practitionerId: 208,
    fullName: "Tobiloba Adeyemi Ogunleye",
    role: "LaboratoryScientist",
    organizationName: "Cedar Diagnostics",
  },
  pharmacist: {
    practitionerId: 316,
    fullName: "Halima Sadiq Bello",
    role: "Pharmacist",
    organizationName: "Green Cross Pharmacy",
  },
  gp: {
    practitionerId: 77,
    fullName: "Ifeoma Grace Okonkwo",
    role: "Doctor",
    organizationName: "Westbridge Family Clinic",
  },
  midwife: {
    practitionerId: 251,
    fullName: "Ngozi Blessing Eze",
    role: "Midwife",
    organizationName: "Westbridge Family Clinic",
  },
} satisfies Record<string, PractitionerRef>;

export interface DemoState {
  passport: Passport | null;
  records: MedicalRecord[];
  accessRequests: AccessRequest[];
  auditEvents: AuditEvent[];
  nextAccessId: number;
  nextPassportId: number;
}

let state: DemoState | null = null;

function seed(): DemoState {
  const now = Math.floor(Date.now() / 1000);
  const { surgeon, labScientist, pharmacist, gp, midwife } = DEMO_PRACTITIONERS;

  const passport: Passport = {
    passportId: 10427,
    patientWalletAddress: DEMO_PATIENT_ADDRESS,
    publicIdentityHash: hash32("identity:10427"),
    createdAt: now - 214 * DAY,
    status: "Active",
    recoveryAddress: "GDPATIENTZURIMWANGIMINJOKPLQMRNSOTPUQVRWSXTYUZV2W3X4Y5Z6",
  };

  const records: MedicalRecord[] = [
    {
      recordId: hash32("record:full-blood-count"),
      passportId: passport.passportId,
      issuedBy: labScientist,
      recordType: "LabResult",
      title: "Full blood count",
      encryptedFileHash: hash32("file:full-blood-count"),
      storagePointerHash: hash32("pointer:full-blood-count"),
      status: "Active",
      issuedAt: now - 6 * DAY,
    },
    {
      recordId: hash32("record:hypertension-review"),
      passportId: passport.passportId,
      issuedBy: gp,
      recordType: "Diagnosis",
      title: "Hypertension follow-up",
      encryptedFileHash: hash32("file:hypertension-review"),
      storagePointerHash: hash32("pointer:hypertension-review"),
      status: "Active",
      issuedAt: now - 21 * DAY,
    },
    {
      recordId: hash32("record:amlodipine"),
      passportId: passport.passportId,
      issuedBy: pharmacist,
      recordType: "Prescription",
      title: "Amlodipine 5mg, 30 days",
      encryptedFileHash: hash32("file:amlodipine"),
      storagePointerHash: hash32("pointer:amlodipine"),
      status: "Active",
      issuedAt: now - 20 * DAY,
    },
    {
      recordId: hash32("record:penicillin-allergy"),
      passportId: passport.passportId,
      issuedBy: surgeon,
      recordType: "AllergyRecord",
      title: "Penicillin allergy — anaphylaxis risk",
      encryptedFileHash: hash32("file:penicillin-allergy"),
      storagePointerHash: hash32("pointer:penicillin-allergy"),
      status: "Active",
      issuedAt: now - 168 * DAY,
    },
    {
      recordId: hash32("record:yellow-fever"),
      passportId: passport.passportId,
      issuedBy: midwife,
      recordType: "Vaccination",
      title: "Yellow fever vaccination",
      encryptedFileHash: hash32("file:yellow-fever"),
      storagePointerHash: hash32("pointer:yellow-fever"),
      status: "Active",
      issuedAt: now - 190 * DAY,
    },
    {
      recordId: hash32("record:lipid-panel"),
      passportId: passport.passportId,
      issuedBy: labScientist,
      recordType: "LabResult",
      title: "Lipid panel (superseded)",
      encryptedFileHash: hash32("file:lipid-panel"),
      storagePointerHash: hash32("pointer:lipid-panel"),
      status: "Amended",
      issuedAt: now - 96 * DAY,
    },
    {
      recordId: hash32("record:discharge-summary"),
      passportId: passport.passportId,
      issuedBy: surgeon,
      recordType: "MedicalSummary",
      title: "Discharge summary — day surgery",
      encryptedFileHash: hash32("file:discharge-summary"),
      storagePointerHash: hash32("pointer:discharge-summary"),
      status: "Active",
      issuedAt: now - 142 * DAY,
    },
  ];

  const accessRequests: AccessRequest[] = [
    {
      accessId: 5104,
      passportId: passport.passportId,
      requestedBy: surgeon,
      recordScope: "EmergencySummaryOnly",
      durationSeconds: 24 * HOUR,
      purpose: "Pre-operative assessment ahead of scheduled surgery on Thursday.",
      status: "Pending",
      requestedAt: now - 4 * HOUR,
      expiresAt: 0,
    },
    {
      accessId: 5103,
      passportId: passport.passportId,
      requestedBy: midwife,
      recordScope: "VaccinationRecordsOnly",
      durationSeconds: 7 * DAY,
      purpose: "Checking vaccination cover before an antenatal appointment.",
      status: "Pending",
      requestedAt: now - 2 * DAY,
      expiresAt: 0,
    },
    {
      accessId: 5098,
      passportId: passport.passportId,
      requestedBy: gp,
      recordScope: "AllRecords",
      durationSeconds: 30 * DAY,
      purpose: "Ongoing hypertension management and medication review.",
      status: "Approved",
      requestedAt: now - 21 * DAY,
      expiresAt: now + 9 * DAY,
    },
    {
      accessId: 5095,
      passportId: passport.passportId,
      requestedBy: labScientist,
      recordScope: "LabResultsOnly",
      durationSeconds: 24 * HOUR,
      purpose: "Uploading the full blood count requested by Westbridge Family Clinic.",
      status: "Approved",
      requestedAt: now - 7 * DAY,
      expiresAt: now + 16 * HOUR,
    },
    {
      accessId: 5081,
      passportId: passport.passportId,
      requestedBy: pharmacist,
      recordScope: "PrescriptionsOnly",
      durationSeconds: 30 * DAY,
      purpose: "Dispensing repeat medication.",
      status: "Revoked",
      requestedAt: now - 62 * DAY,
      expiresAt: now - 30 * DAY,
    },
    {
      accessId: 5074,
      passportId: passport.passportId,
      requestedBy: surgeon,
      recordScope: "AllRecords",
      durationSeconds: 30 * DAY,
      purpose: "Reviewing full history ahead of an elective procedure.",
      status: "Rejected",
      requestedAt: now - 88 * DAY,
      expiresAt: 0,
    },
  ];

  const auditEvents: AuditEvent[] = [
    event(
      "AccessRequested",
      surgeon.fullName,
      `${surgeon.fullName} requested emergency summary access`,
      now - 4 * HOUR,
    ),
    event(
      "RecordAdded",
      labScientist.fullName,
      "Full blood count added to your passport",
      now - 6 * DAY,
    ),
    event(
      "AccessApproved",
      "You",
      `You approved 24 hours of lab result access for ${labScientist.fullName}`,
      now - 7 * DAY,
    ),
    event(
      "RecordAdded",
      pharmacist.fullName,
      "Amlodipine 5mg prescription recorded",
      now - 20 * DAY,
    ),
    event(
      "AccessApproved",
      "You",
      `You approved 30 days of full access for ${gp.fullName}`,
      now - 21 * DAY,
    ),
    event(
      "AccessRevoked",
      "You",
      `You revoked prescription access for ${pharmacist.fullName}`,
      now - 30 * DAY,
    ),
    event(
      "RecordAmended",
      labScientist.fullName,
      "Lipid panel superseded by a corrected result",
      now - 90 * DAY,
    ),
    event(
      "AccessRejected",
      "You",
      `You rejected a full-access request from ${surgeon.fullName}`,
      now - 88 * DAY,
    ),
    event("RecoveryUpdated", "You", "Recovery address updated", now - 120 * DAY),
    event("PassportCreated", "You", "Medical passport created on Stellar", now - 214 * DAY),
  ];

  return {
    passport,
    records,
    accessRequests,
    auditEvents,
    nextAccessId: 5105,
    nextPassportId: 10428,
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

export { hash32 };
