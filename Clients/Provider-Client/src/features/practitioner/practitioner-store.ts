import { locka } from "@/lib/locka-client";
import type { AccessRequest, AuditEvent, MedicalRecord, Practitioner } from "@/lib/domain";
import { errorMessage } from "@/lib/utils";

/**
 * The practitioner view, held in one module-level store.
 *
 * Loads are triggered by wallet events — connecting, restoring a session, or an
 * explicit refresh after a write — rather than by a render effect. That keeps
 * the fetch where the thing that causes it happens, and lets every screen read
 * the same snapshot through `useSyncExternalStore`.
 */

export type PractitionerLoadStatus = "idle" | "loading" | "ready" | "error";

export interface PractitionerSnapshot {
  /** Account the snapshot belongs to, or null when no wallet is connected. */
  address: string | null;
  status: PractitionerLoadStatus;
  error: string | null;
  practitioner: Practitioner | null;
  accessRequests: AccessRequest[];
  /** Records this practitioner issued, whoever holds the passport. */
  records: MedicalRecord[];
  /**
   * Records readable under each live grant, keyed by passport id. Loaded up
   * front for the open grants only, since that is the whole set a practitioner
   * is allowed to see.
   */
  patientRecords: Record<number, MedicalRecord[]>;
  auditEvents: AuditEvent[];
}

const INITIAL: PractitionerSnapshot = {
  address: null,
  status: "idle",
  error: null,
  practitioner: null,
  accessRequests: [],
  records: [],
  patientRecords: {},
  auditEvents: [],
};

let snapshot: PractitionerSnapshot = INITIAL;
const listeners = new Set<() => void>();

function set(next: PractitionerSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function subscribePractitionerStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPractitionerSnapshot(): PractitionerSnapshot {
  return snapshot;
}

/** Server render has no wallet, so the store always starts empty there. */
export function getPractitionerServerSnapshot(): PractitionerSnapshot {
  return INITIAL;
}

/**
 * Reads everything for one account. Concurrent calls are resolved by address:
 * a response for an account that is no longer connected is discarded.
 */
export async function loadPractitioner(address: string): Promise<void> {
  set({ ...INITIAL, address, status: "loading" });

  try {
    const practitioner = await locka.getPractitioner(address);

    if (!practitioner) {
      if (snapshot.address !== address) return;
      set({ ...INITIAL, address, status: "ready" });
      return;
    }

    const [accessRequests, records, auditEvents] = await Promise.all([
      locka.listAccessRequests(practitioner.practitionerId),
      locka.listIssuedRecords(practitioner.practitionerId),
      locka.listAuditEvents(practitioner.practitionerId),
    ]);

    const patientRecords = await loadGrantedRecords(practitioner.practitionerId, accessRequests);

    if (snapshot.address !== address) return;
    set({
      address,
      status: "ready",
      error: null,
      practitioner,
      accessRequests,
      records,
      patientRecords,
      auditEvents,
    });
  } catch (caught) {
    if (snapshot.address !== address) return;
    set({ ...INITIAL, address, status: "error", error: errorMessage(caught) });
  }
}

/**
 * Reads the records behind every approved grant, so opening a patient needs no
 * further fetch. A patient with no live grant is simply absent from the map.
 */
async function loadGrantedRecords(
  practitionerId: number,
  accessRequests: AccessRequest[],
): Promise<Record<number, MedicalRecord[]>> {
  const passportIds = Array.from(
    new Set(
      accessRequests
        .filter((request) => request.status === "Approved")
        .map((request) => request.passportId),
    ),
  );

  const entries = await Promise.all(
    passportIds.map(
      async (passportId) =>
        [passportId, await locka.listPatientRecords(practitionerId, passportId)] as const,
    ),
  );

  return Object.fromEntries(entries);
}

/** Re-reads the account already in the store, after a write. */
export async function refreshPractitioner(): Promise<void> {
  const { address } = snapshot;
  if (!address) return;
  await loadPractitioner(address);
}

export function clearPractitioner(): void {
  set(INITIAL);
}
