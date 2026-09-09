import { locka } from "@/lib/locka-client";
import type { AccessRequest, AuditEvent, MedicalRecord, Provider } from "@/lib/domain";
import { errorMessage } from "@/lib/utils";

/**
 * The provider view, held in one module-level store.
 *
 * Loads are triggered by wallet events — connecting, restoring a session, or an
 * explicit refresh after a write — rather than by a render effect. That keeps
 * the fetch where the thing that causes it happens, and lets every screen read
 * the same snapshot through `useSyncExternalStore`.
 */

export type ProviderLoadStatus = "idle" | "loading" | "ready" | "error";

export interface ProviderSnapshot {
  /** Account the snapshot belongs to, or null when no wallet is connected. */
  address: string | null;
  status: ProviderLoadStatus;
  error: string | null;
  provider: Provider | null;
  accessRequests: AccessRequest[];
  /** Records this provider issued, whoever holds the passport. */
  records: MedicalRecord[];
  /**
   * Records readable under each live grant, keyed by passport id. Loaded up
   * front for the open grants only, since that is the whole set a provider is
   * allowed to see.
   */
  patientRecords: Record<number, MedicalRecord[]>;
  auditEvents: AuditEvent[];
}

const INITIAL: ProviderSnapshot = {
  address: null,
  status: "idle",
  error: null,
  provider: null,
  accessRequests: [],
  records: [],
  patientRecords: {},
  auditEvents: [],
};

let snapshot: ProviderSnapshot = INITIAL;
const listeners = new Set<() => void>();

function set(next: ProviderSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function subscribeProviderStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProviderSnapshot(): ProviderSnapshot {
  return snapshot;
}

/** Server render has no wallet, so the store always starts empty there. */
export function getProviderServerSnapshot(): ProviderSnapshot {
  return INITIAL;
}

/**
 * Reads everything for one account. Concurrent calls are resolved by address:
 * a response for an account that is no longer connected is discarded.
 */
export async function loadProvider(address: string): Promise<void> {
  set({ ...INITIAL, address, status: "loading" });

  try {
    const provider = await locka.getProvider(address);

    if (!provider) {
      if (snapshot.address !== address) return;
      set({ ...INITIAL, address, status: "ready" });
      return;
    }

    const [accessRequests, records, auditEvents] = await Promise.all([
      locka.listAccessRequests(provider.providerId),
      locka.listIssuedRecords(provider.providerId),
      locka.listAuditEvents(provider.providerId),
    ]);

    const patientRecords = await loadGrantedRecords(provider.providerId, accessRequests);

    if (snapshot.address !== address) return;
    set({
      address,
      status: "ready",
      error: null,
      provider,
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
  providerId: string,
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
        [passportId, await locka.listPatientRecords(providerId, passportId)] as const,
    ),
  );

  return Object.fromEntries(entries);
}

/** Re-reads the account already in the store, after a write. */
export async function refreshProvider(): Promise<void> {
  const { address } = snapshot;
  if (!address) return;
  await loadProvider(address);
}

export function clearProvider(): void {
  set(INITIAL);
}
