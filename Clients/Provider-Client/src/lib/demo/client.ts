import {
  formatPassportId,
  formatPractitionerId,
  type AccessRequest,
  type MedicalRecord,
  type Practitioner,
  type RecordStatus,
} from "../domain";
import type {
  AddRecordInput,
  PassportLookup,
  PractitionerClient,
  RegisterPractitionerInput,
  RequestAccessInput,
  TxResult,
} from "../locka-client";
import { DEMO_PASSPORTS, hash32, ledger, recordEvent, refOf } from "./ledger";

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

export const demoPractitionerClient: PractitionerClient = {
  async getPractitioner(address: string) {
    const { practitioner } = ledger();
    return settle(practitioner?.walletAddress === address ? practitioner : null);
  },

  async registerPractitioner(input: RegisterPractitionerInput) {
    const state = ledger();

    // The registry mints the id from the submitted details, and it is what gets
    // stamped on every record and request from here on.
    const practitioner: Practitioner = {
      practitionerId: state.nextPractitionerId,
      walletAddress: input.address,
      fullName: input.fullName,
      role: input.role,
      licenseNumber: input.licenseNumber,
      licenseHash: input.licenseHash,
      organizationName: input.organizationName,
      organizationType: input.organizationType,
      country: input.country,
      // Auto-approved for now. Administrator review slots in here later.
      status: "Verified",
      registeredAt: nowSeconds(),
    };
    state.nextPractitionerId += 1;
    state.practitioner = practitioner;

    const txHash = recordEvent(
      "PractitionerRegistered",
      practitioner.fullName,
      `Registered as ${formatPractitionerId(practitioner.practitionerId)} at ${practitioner.organizationName}`,
    );
    return settle({ practitioner, txHash }, 900);
  },

  async listAccessRequests(practitionerId: number) {
    const requests = ledger()
      .accessRequests.filter((request) => request.requestedBy.practitionerId === practitionerId)
      .map(withExpiry)
      .sort((a, b) => b.requestedAt - a.requestedAt);
    return settle(requests);
  },

  async requestAccess(input: RequestAccessInput) {
    const state = ledger();
    if (!state.practitioner)
      throw new Error("Register as a practitioner before requesting access.");
    if (state.practitioner.status !== "Verified") {
      throw new Error("This registration cannot request patient access.");
    }
    if (!DEMO_PASSPORTS.some((entry) => entry.passportId === input.passportId)) {
      throw new Error("No passport exists with that id.");
    }

    const request: AccessRequest = {
      accessId: state.nextAccessId,
      passportId: input.passportId,
      requestedBy: refOf(state.practitioner),
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
      state.practitioner.fullName,
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
      state.practitioner?.fullName ?? "Practitioner",
      `Handed back access to ${formatPassportId(request.passportId)}`,
    );
    return settle({ txHash }, 900);
  },

  async listIssuedRecords(practitionerId: number) {
    const records = ledger()
      .records.filter((record) => record.issuedBy.practitionerId === practitionerId)
      .sort((a, b) => b.issuedAt - a.issuedAt);
    return settle(records);
  },

  async addRecord(input: AddRecordInput) {
    const state = ledger();
    if (!state.practitioner) throw new Error("Register as a practitioner before adding records.");
    if (state.practitioner.status !== "Verified") {
      throw new Error("This registration cannot add records to a passport.");
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
      // The practitioner id is stamped here, so the patient can always trace the
      // result back to the person who issued it.
      issuedBy: refOf(state.practitioner),
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
      state.practitioner.fullName,
      `${input.title} issued to ${formatPassportId(input.passportId)}`,
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
      state.practitioner?.fullName ?? "Practitioner",
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

  async listPatientRecords(practitionerId: number, passportId: number) {
    const state = ledger();
    const grant = state.accessRequests
      .filter(
        (request) =>
          request.requestedBy.practitionerId === practitionerId &&
          request.passportId === passportId,
      )
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
