import type { AccessRequest, AuditEvent, MedicalRecord, Passport } from "../domain";
import type { AccessDecision, CreatePassportInput, PatientClient, TxResult } from "../locka-client";
import { ledger, recordEvent } from "./ledger";

/** Stands in for network round-trips so loading states are exercised. */
function settle<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Approved grants lapse on their own once `expires_at` passes. The contract
 * derives this at read time rather than storing an "expired" state, so the demo
 * client does the same.
 */
function withExpiry(request: AccessRequest): AccessRequest {
  if (request.status === "Approved" && request.expiresAt > 0 && request.expiresAt <= nowSeconds()) {
    return { ...request, status: "Expired" };
  }
  return request;
}

export const demoPatientClient: PatientClient = {
  async getPassport(walletAddress: string): Promise<Passport | null> {
    const { passport } = ledger();
    const match = passport?.patientWalletAddress === walletAddress ? passport : null;
    return settle(match);
  },

  async createPassport(input: CreatePassportInput) {
    const state = ledger();
    const passport: Passport = {
      passportId: state.nextPassportId,
      patientWalletAddress: input.walletAddress,
      publicIdentityHash: input.publicIdentityHash,
      createdAt: nowSeconds(),
      status: "Active",
      recoveryAddress: input.recoveryAddress,
    };
    state.nextPassportId += 1;
    state.passport = passport;
    const txHash = recordEvent("PassportCreated", "You", "Medical passport created on Stellar");
    return settle({ passport, txHash }, 900);
  },

  async updateRecoveryAddress(passportId: number, recoveryAddress: string): Promise<TxResult> {
    const state = ledger();
    if (!state.passport || state.passport.passportId !== passportId) {
      throw new Error("No passport found for this wallet.");
    }
    state.passport = { ...state.passport, recoveryAddress };
    const txHash = recordEvent("RecoveryUpdated", "You", "Recovery address updated");
    return settle({ txHash }, 900);
  },

  async listRecords(passportId: number): Promise<MedicalRecord[]> {
    const records = ledger()
      .records.filter((record) => record.passportId === passportId)
      .sort((a, b) => b.issuedAt - a.issuedAt);
    return settle(records);
  },

  async getRecord(recordId: string): Promise<MedicalRecord | null> {
    const record = ledger().records.find((entry) => entry.recordId === recordId) ?? null;
    return settle(record);
  },

  async verifyRecordHash(recordId: string, fileHash: string): Promise<boolean> {
    const record = ledger().records.find((entry) => entry.recordId === recordId);
    if (!record) throw new Error("No record exists with that id.");
    return settle(record.encryptedFileHash.toLowerCase() === fileHash.toLowerCase(), 600);
  },

  async listAccessRequests(passportId: number): Promise<AccessRequest[]> {
    const requests = ledger()
      .accessRequests.filter((request) => request.passportId === passportId)
      .map(withExpiry)
      .sort((a, b) => b.requestedAt - a.requestedAt);
    return settle(requests);
  },

  async decideAccess(
    accessId: number,
    decision: AccessDecision,
    durationSeconds?: number,
  ): Promise<TxResult> {
    const state = ledger();
    const request = state.accessRequests.find((entry) => entry.accessId === accessId);
    if (!request) throw new Error("That access request no longer exists.");

    if (decision === "approve") {
      const window = durationSeconds ?? request.durationSeconds;
      request.status = "Approved";
      request.durationSeconds = window;
      request.expiresAt = nowSeconds() + window;
    } else if (decision === "reject") {
      request.status = "Rejected";
      request.expiresAt = 0;
    } else {
      request.status = "Revoked";
      request.expiresAt = nowSeconds();
    }

    const kind =
      decision === "approve"
        ? "AccessApproved"
        : decision === "reject"
          ? "AccessRejected"
          : "AccessRevoked";
    const verb =
      decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "revoked";
    const txHash = recordEvent(
      kind,
      "You",
      `You ${verb} access for ${request.requestedBy.fullName}`,
    );
    return settle({ txHash }, 900);
  },

  async listAuditEvents(): Promise<AuditEvent[]> {
    const events = [...ledger().auditEvents].sort((a, b) => b.at - a.at);
    return settle(events);
  },
};
