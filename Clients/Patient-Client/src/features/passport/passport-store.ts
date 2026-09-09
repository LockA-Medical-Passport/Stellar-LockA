import { locka } from "@/lib/locka-client";
import type { AccessRequest, AuditEvent, MedicalRecord, Passport } from "@/lib/domain";
import { errorMessage } from "@/lib/utils";

/**
 * The passport view, held in one module-level store.
 *
 * Loads are triggered by wallet events — connecting, restoring a session, or an
 * explicit refresh after a write — rather than by a render effect. That keeps
 * the fetch where the thing that causes it happens, and lets every screen read
 * the same snapshot through `useSyncExternalStore`.
 *
 * Same shape as `components/ui/toast-store.ts`, for the same reason: the write
 * (a consent decision, deep in a card) and the reads (the sidebar badge, the
 * activity table) sit in unrelated branches of the tree.
 */

export type PassportStatus = "idle" | "loading" | "ready" | "error";

export interface PassportSnapshot {
  /** Account the snapshot belongs to, or null when no wallet is connected. */
  address: string | null;
  status: PassportStatus;
  error: string | null;
  passport: Passport | null;
  records: MedicalRecord[];
  accessRequests: AccessRequest[];
  auditEvents: AuditEvent[];
}

const EMPTY_RECORDS: MedicalRecord[] = [];
const EMPTY_REQUESTS: AccessRequest[] = [];
const EMPTY_EVENTS: AuditEvent[] = [];

const INITIAL: PassportSnapshot = {
  address: null,
  status: "idle",
  error: null,
  passport: null,
  records: EMPTY_RECORDS,
  accessRequests: EMPTY_REQUESTS,
  auditEvents: EMPTY_EVENTS,
};

let snapshot: PassportSnapshot = INITIAL;
const listeners = new Set<() => void>();

function set(next: PassportSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function subscribePassportStore(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPassportSnapshot(): PassportSnapshot {
  return snapshot;
}

/** Server render has no wallet, so the store always starts empty there. */
export function getPassportServerSnapshot(): PassportSnapshot {
  return INITIAL;
}

/**
 * Reads everything for one account. Concurrent calls are resolved by address:
 * a response for an account that is no longer connected is discarded.
 */
export async function loadPassport(address: string): Promise<void> {
  set({ ...INITIAL, address, status: "loading" });

  try {
    const passport = await locka.getPassport(address);

    if (!passport) {
      if (snapshot.address !== address) return;
      set({ ...INITIAL, address, status: "ready" });
      return;
    }

    const [records, accessRequests, auditEvents] = await Promise.all([
      locka.listRecords(passport.passportId),
      locka.listAccessRequests(passport.passportId),
      locka.listAuditEvents(passport.passportId),
    ]);

    if (snapshot.address !== address) return;
    set({ address, status: "ready", error: null, passport, records, accessRequests, auditEvents });
  } catch (caught) {
    if (snapshot.address !== address) return;
    set({ ...INITIAL, address, status: "error", error: errorMessage(caught) });
  }
}

/** Re-reads the account already in the store, after a write. */
export async function refreshPassport(): Promise<void> {
  const { address } = snapshot;
  if (!address) return;
  await loadPassport(address);
}

export function clearPassport(): void {
  set(INITIAL);
}
