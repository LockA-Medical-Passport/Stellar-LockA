import { config } from "./config";
import { demoPractitionerClient } from "./demo/client";
import type {
  AccessRequest,
  AuditEvent,
  MedicalRecord,
  OrganizationType,
  PassportStatus,
  Practitioner,
  PractitionerRole,
  RecordScope,
  RecordStatus,
  RecordType,
} from "./domain";

/**
 * Everything the practitioner client reads or writes, in one interface.
 *
 * Each method maps onto a Soroban contract call plus, where the value is not
 * held on-chain, a locka-api read. The mapping is noted per method so wiring
 * the real client is a mechanical job.
 */
export interface PractitionerClient {
  /** `provider-registry::get_practitioner_by_wallet` for the connected account. */
  getPractitioner(address: string): Promise<Practitioner | null>;

  /**
   * `provider-registry::register_practitioner`.
   *
   * The registry mints the practitioner id from the submitted details and
   * returns it. Registration is auto-approved for now, so the practitioner can
   * work immediately; administrator review is the step this makes room for.
   */
  registerPractitioner(
    input: RegisterPractitionerInput,
  ): Promise<{ practitioner: Practitioner; txHash: string }>;

  /** `consent-access-manager` provider index: every request this practitioner made. */
  listAccessRequests(practitionerId: number): Promise<AccessRequest[]>;

  /** `consent-access-manager::request_access` */
  requestAccess(input: RequestAccessInput): Promise<{ request: AccessRequest; txHash: string }>;

  /** `consent-access-manager::revoke_access`. A practitioner can hand back a grant early. */
  revokeAccess(accessId: number): Promise<TxResult>;

  /** `medical-record-registry::get_provider_records` */
  listIssuedRecords(practitionerId: number): Promise<MedicalRecord[]>;

  /** `medical-record-registry::add_record`, stamped with the practitioner id. */
  addRecord(input: AddRecordInput): Promise<{ record: MedicalRecord; txHash: string }>;

  /** `medical-record-registry::update_record_status` */
  updateRecordStatus(recordId: string, status: RecordStatus): Promise<TxResult>;

  /** `medical-record-registry::verify_record_hash` */
  verifyRecordHash(recordId: string, fileHash: string): Promise<boolean>;

  /**
   * Confirms a passport id exists before a request is sent. Returns only what a
   * practitioner may see without consent: that the passport exists, and its status.
   */
  lookupPassport(passportId: number): Promise<PassportLookup | null>;

  /** Records readable under a live grant. Empty while a grant is pending. */
  listPatientRecords(practitionerId: number, passportId: number): Promise<MedicalRecord[]>;

  /** Contract events for this practitioner, collected by the locka-api indexer. */
  listAuditEvents(practitionerId: number): Promise<AuditEvent[]>;
}

export interface RegisterPractitionerInput {
  /** Stellar account the registration is held under. */
  address: string;
  /** Full government name, as it appears on the practising licence. */
  fullName: string;
  role: PractitionerRole;
  /** Licence number, checkable against the issuing council's register. */
  licenseNumber: string;
  /** `BytesN<32>` commitment to the licence number, hashed in the browser. */
  licenseHash: string;
  organizationName: string;
  organizationType: OrganizationType;
  country: string;
}

export interface RequestAccessInput {
  practitionerId: number;
  passportId: number;
  recordScope: RecordScope;
  durationSeconds: number;
  purpose: string;
}

export interface AddRecordInput {
  practitionerId: number;
  passportId: number;
  recordType: RecordType;
  title: string;
  /** Hash of the encrypted document held in the off-chain vault. */
  encryptedFileHash: string;
  /** Hash of the storage pointer, such as an IPFS CID or object key. */
  storagePointerHash: string;
}

export interface PassportLookup {
  passportId: number;
  status: PassportStatus;
}

export interface TxResult {
  /** Stellar transaction hash, linkable on the block explorer. */
  txHash: string;
}

const notWired = (): never => {
  throw new Error(
    "The Soroban client is not implemented yet. Run with NEXT_PUBLIC_DEMO_MODE=true, or implement sorobanPractitionerClient in lib/locka-client.ts.",
  );
};

/**
 * The live client. Left unimplemented on purpose: it needs Freighter signing
 * and generated contract bindings, which are the next task after this UI.
 */
const sorobanPractitionerClient: PractitionerClient = {
  getPractitioner: notWired,
  registerPractitioner: notWired,
  listAccessRequests: notWired,
  requestAccess: notWired,
  revokeAccess: notWired,
  listIssuedRecords: notWired,
  addRecord: notWired,
  updateRecordStatus: notWired,
  verifyRecordHash: notWired,
  lookupPassport: notWired,
  listPatientRecords: notWired,
  listAuditEvents: notWired,
};

export const locka: PractitionerClient = config.demoMode
  ? demoPractitionerClient
  : sorobanPractitionerClient;
