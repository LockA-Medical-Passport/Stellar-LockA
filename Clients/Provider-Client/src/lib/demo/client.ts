import {
  formatPassportId,
  type AccessRequest,
  type MedicalRecord,
  type RecordStatus,
} from "../domain";
import type {
  AddRecordInput,
  PassportLookup,
  ProviderClient,
  RegisterProviderInput,
  RequestAccessInput,
  TxResult,
} from "../locka-client";
import { DEMO_PASSPORTS, hash32, ledger, recordEvent } from "./ledger";

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

/** A grant is only readable while it is approved and inside its window. */
function isLiveGrant(request: AccessRequest): boolean {
  return request.status === "Approved" && request.expiresAt > nowSeconds();
}

export const demoProviderClient: ProviderClient = {
  async getProvider(address: string) {
    const { provider } = ledger();
    return settle(provider?.providerId === address ? provider : null);
  },

  async registerProvider(input: RegisterProviderInput) {
    const state = ledger();
    const provider = {
      providerId: input.address,
      name: input.name,
      providerType: input.providerType,
      country: input.country,
      licenseHash: input.licenseHash,
      status: "Pending" as const,
      registeredAt: nowSeconds(),
    };
    state.provider = provider;
    const txHash = recordEvent(
      "ProviderRegistered",
      input.name,
      `${input.name} registered and is awaiting verification`,
    );
    return settle({ provider, txHash }, 900);
  },

  async listAccessRequests(providerId: string) {
    const requests = ledger()
      .accessRequests.filter((request) => request.providerId === providerId)
      .map(withExpiry)
      .sort((a, b) => b.requestedAt - a.requestedAt);
    return settle(requests);
  },

  async requestAccess(input: RequestAccessInput) {
    const state = ledger();
    if (!state.provider) throw new Error("Register as a provider before requesting access.");
    if (state.provider.status !== "Verified") {
      throw new Error("Only verified providers can request patient access.");
    }
    if (!DEMO_PASSPORTS.some((entry) => entry.passportId === input.passportId)) {
      throw new Error("No passport exists with that id.");
    }

    const request: AccessRequest = {
      accessId: state.nextAccessId,
      passportId: input.passportId,
      providerId: input.providerId,
      providerName: state.provider.name,
      providerType: state.provider.providerType,
      recordScope: input.recordScope,
      durationSeconds: input.durationSeconds,
      purpose: input.purpose,
      status: "Pending",
      requestedAt: nowSeconds(),
      expiresAt: 0,
    };
    state.nextAccessId += 1;
    state.accessRequests = [request, ...state.accessRequests];

    const txHash = recordEvent(
      "AccessRequested",
      state.provider.name,
      `Requested access to ${formatPassportId(input.passportId)}`,
    );
    return settle({ request, txHash }, 900);
  },

  async revokeAccess(accessId: number): Promise<TxResult> {
    const state = ledger();
    const request = state.accessRequests.find((entry) => entry.accessId === accessId);
    if (!request) throw new Error("That access request no longer exists.");

    request.status = "Revoked";
    request.expiresAt = nowSeconds();
    const txHash = recordEvent(
      "AccessRevoked",
      state.provider?.name ?? "Provider",
      `Handed back access to ${formatPassportId(request.passportId)}`,
    );
    return settle({ txHash }, 900);
  },

  async listIssuedRecords(providerId: string) {
    const records = ledger()
      .records.filter((record) => record.providerId === providerId)
      .sort((a, b) => b.issuedAt - a.issuedAt);
    return settle(records);
  },

  async addRecord(input: AddRecordInput) {
    const state = ledger();
    if (!state.provider) throw new Error("Register as a provider before adding records.");
    if (state.provider.status !== "Verified") {
      throw new Error("Only verified providers can add records to a passport.");
    }

    const grant = state.accessRequests
      .filter((request) => request.passportId === input.passportId)
      .find(isLiveGrant);
    if (!grant) {
      throw new Error(
        `No live grant for ${formatPassportId(input.passportId)}. Request access and wait for the patient to approve it.`,
      );
    }

    const record: MedicalRecord = {
      recordId: hash32(`record:${input.passportId}:${input.title}:${nowSeconds()}`),
      passportId: input.passportId,
      providerId: input.providerId,
      providerName: state.provider.name,
      recordType: input.recordType,
      title: input.title,
      encryptedFileHash: input.encryptedFileHash,
      storagePointerHash: input.storagePointerHash,
      status: "Active",
      issuedAt: nowSeconds(),
    };
    state.records = [record, ...state.records];

    const txHash = recordEvent(
      "RecordAdded",
      state.provider.name,
      `${input.title} added for ${formatPassportId(input.passportId)}`,
    );
    return settle({ record, txHash }, 900);
  },

  async updateRecordStatus(recordId: string, status: RecordStatus): Promise<TxResult> {
    const state = ledger();
    const record = state.records.find((entry) => entry.recordId === recordId);
    if (!record) throw new Error("No record exists with that id.");
    if (record.status === "Revoked") throw new Error("A revoked record cannot change status.");
    if (status === "Amended" && record.status !== "Active") {
      throw new Error("Only an active record can be marked amended.");
    }

    record.status = status;
    const txHash = recordEvent(
      status === "Amended" ? "RecordAmended" : "RecordRevoked",
      state.provider?.name ?? "Provider",
      `${record.title} marked ${status.toLowerCase()}`,
    );
    return settle({ txHash }, 900);
  },

  async verifyRecordHash(recordId: string, fileHash: string) {
    const record = ledger().records.find((entry) => entry.recordId === recordId);
    if (!record) throw new Error("No record exists with that id.");
    return settle(record.encryptedFileHash.toLowerCase() === fileHash.toLowerCase(), 600);
  },

  async lookupPassport(passportId: number): Promise<PassportLookup | null> {
    const match = DEMO_PASSPORTS.find((entry) => entry.passportId === passportId) ?? null;
    return settle(match, 500);
  },

  async listPatientRecords(providerId: string, passportId: number) {
    const state = ledger();
    const grant = state.accessRequests
      .filter((request) => request.providerId === providerId && request.passportId === passportId)
      .find(isLiveGrant);
    if (!grant) return settle<MedicalRecord[]>([]);

    const records = state.records
      .filter((record) => record.passportId === passportId)
      .filter((record) => scopeAllows(grant.recordScope, record))
      .sort((a, b) => b.issuedAt - a.issuedAt);
    return settle(records);
  },

  async listAuditEvents() {
    const events = [...ledger().auditEvents].sort((a, b) => b.at - a.at);
    return settle(events);
  },
};

/** Mirrors the record categories each `RecordScope` variant opens. */
function scopeAllows(scope: AccessRequest["recordScope"], record: MedicalRecord): boolean {
  switch (scope) {
    case "AllRecords":
      return true;
    case "LabResultsOnly":
      return record.recordType === "LabResult";
    case "PrescriptionsOnly":
      return record.recordType === "Prescription";
    case "VaccinationRecordsOnly":
      return record.recordType === "Vaccination";
    case "EmergencySummaryOnly":
      return record.recordType === "AllergyRecord" || record.recordType === "MedicalSummary";
    case "InsuranceDataOnly":
      return record.recordType === "InsuranceRecord";
  }
}
