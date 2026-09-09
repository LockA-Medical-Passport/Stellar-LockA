import { config } from "./config";
import { demoProviderClient } from "./demo/client";
import type {
  AccessRequest,
  AuditEvent,
  MedicalRecord,
  PassportStatus,
  Provider,
  ProviderType,
  RecordScope,
  RecordStatus,
  RecordType,
} from "./domain";

/**
 * Everything the provider client reads or writes, in one interface.
 *
 * Each method maps onto a Soroban contract call plus, where the value is not
 * held on-chain, a locka-api read. The mapping is noted per method so wiring
 * the real client is a mechanical job.
 */
export interface ProviderClient {
  /** `provider-registry::get_provider` for the connected account. */
  getProvider(address: string): Promise<Provider | null>;

  /** `provider-registry::register_provider`. Lands as `Pending` until an admin verifies. */
  registerProvider(input: RegisterProviderInput): Promise<{ provider: Provider; txHash: string }>;

  /** `consent-access-manager` provider index: every request this provider has made. */
  listAccessRequests(providerId: string): Promise<AccessRequest[]>;

  /** `consent-access-manager::request_access` */
  requestAccess(input: RequestAccessInput): Promise<{ request: AccessRequest; txHash: string }>;

  /** `consent-access-manager::revoke_access`. A provider can hand back a grant early. */
  revokeAccess(accessId: number): Promise<TxResult>;

  /** `medical-record-registry::get_provider_records` */
  listIssuedRecords(providerId: string): Promise<MedicalRecord[]>;

  /** `medical-record-registry::add_record` */
  addRecord(input: AddRecordInput): Promise<{ record: MedicalRecord; txHash: string }>;

  /** `medical-record-registry::update_record_status` */
  updateRecordStatus(recordId: string, status: RecordStatus): Promise<TxResult>;

  /** `medical-record-registry::verify_record_hash` */
  verifyRecordHash(recordId: string, fileHash: string): Promise<boolean>;

  /**
   * Confirms a passport id exists before a request is sent. Returns only what a
   * provider may see without consent: that the passport exists, and its status.
   */
  lookupPassport(passportId: number): Promise<PassportLookup | null>;

  /** Records readable under a live grant. Empty while a grant is pending. */
  listPatientRecords(providerId: string, passportId: number): Promise<MedicalRecord[]>;

  /** Contract events for this provider, collected by the locka-api indexer. */
  listAuditEvents(providerId: string): Promise<AuditEvent[]>;
}

export interface RegisterProviderInput {
  address: string;
  name: string;
  providerType: ProviderType;
  country: string;
  /** `BytesN<32>` commitment to the practising licence. */
  licenseHash: string;
}

export interface RequestAccessInput {
  providerId: string;
  passportId: number;
  recordScope: RecordScope;
  durationSeconds: number;
  purpose: string;
}

export interface AddRecordInput {
  providerId: string;
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
    "The Soroban client is not implemented yet. Run with NEXT_PUBLIC_DEMO_MODE=true, or implement sorobanProviderClient in lib/locka-client.ts.",
  );
};

/**
 * The live client. Left unimplemented on purpose: it needs Freighter signing
 * and generated contract bindings, which are the next task after this UI.
 */
const sorobanProviderClient: ProviderClient = {
  getProvider: notWired,
  registerProvider: notWired,
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

export const locka: ProviderClient = config.demoMode ? demoProviderClient : sorobanProviderClient;
