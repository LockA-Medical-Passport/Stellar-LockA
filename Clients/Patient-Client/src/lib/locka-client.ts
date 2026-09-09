import { config } from "./config";
import { demoPatientClient } from "./demo/client";
import type { AccessRequest, AuditEvent, MedicalRecord, Passport } from "./domain";

/**
 * Everything the patient client reads or writes, in one interface.
 *
 * Each method maps onto a Soroban contract call plus, where the value is not
 * held on-chain, a locka-api read. The mapping is noted per method so wiring
 * the real client is a mechanical job.
 */
export interface PatientClient {
  /** `patient-passport-registry::get_passport_by_wallet` */
  getPassport(walletAddress: string): Promise<Passport | null>;

  /** `patient-passport-registry::register_patient` */
  createPassport(input: CreatePassportInput): Promise<{ passport: Passport; txHash: string }>;

  /** `patient-passport-registry::update_recovery_address` */
  updateRecoveryAddress(passportId: number, recoveryAddress: string): Promise<TxResult>;

  /** `medical-record-registry::get_patient_records`, hydrated via locka-api. */
  listRecords(passportId: number): Promise<MedicalRecord[]>;

  /** `medical-record-registry::get_record_metadata` */
  getRecord(recordId: string): Promise<MedicalRecord | null>;

  /** `medical-record-registry::verify_record_hash` */
  verifyRecordHash(recordId: string, fileHash: string): Promise<boolean>;

  /** `consent-access-manager` patient index, one entry per access request. */
  listAccessRequests(passportId: number): Promise<AccessRequest[]>;

  /**
   * `consent-access-manager::approve_access` / `reject_access` /
   * `revoke_access`. `durationSeconds` narrows an approval below the window
   * the provider asked for.
   */
  decideAccess(
    accessId: number,
    decision: AccessDecision,
    durationSeconds?: number,
  ): Promise<TxResult>;

  /** Contract events collected by the locka-api indexer. */
  listAuditEvents(passportId: number): Promise<AuditEvent[]>;
}

export interface CreatePassportInput {
  walletAddress: string;
  publicIdentityHash: string;
  recoveryAddress: string | null;
}

export type AccessDecision = "approve" | "reject" | "revoke";

export interface TxResult {
  /** Stellar transaction hash, linkable on the block explorer. */
  txHash: string;
}

const notWired = (): never => {
  throw new Error(
    "The Soroban client is not implemented yet. Run with NEXT_PUBLIC_DEMO_MODE=true, or implement sorobanPatientClient in lib/locka-client.ts.",
  );
};

/**
 * The live client. Left unimplemented on purpose: it needs Freighter signing
 * and generated contract bindings, which are the next task after this UI.
 */
const sorobanPatientClient: PatientClient = {
  getPassport: notWired,
  createPassport: notWired,
  updateRecoveryAddress: notWired,
  listRecords: notWired,
  getRecord: notWired,
  verifyRecordHash: notWired,
  listAccessRequests: notWired,
  decideAccess: notWired,
  listAuditEvents: notWired,
};

export const locka: PatientClient = config.demoMode ? demoPatientClient : sorobanPatientClient;
