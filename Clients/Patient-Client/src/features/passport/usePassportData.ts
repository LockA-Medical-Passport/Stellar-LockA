"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useWallet } from "@/features/wallet/WalletContext";
import type { AccessRequest, AuditEvent, MedicalRecord, Passport } from "@/lib/domain";
import {
  getPassportServerSnapshot,
  getPassportSnapshot,
  refreshPassport,
  subscribePassportStore,
} from "./passport-store";

export interface PassportData {
  /**
   * True while the stored wallet session is being restored, or while the
   * connected account's read is in flight. Screens can treat it as "not ready".
   */
  loading: boolean;
  error: string | null;
  passport: Passport | null;
  records: MedicalRecord[];
  accessRequests: AccessRequest[];
  auditEvents: AuditEvent[];
  /** Requests waiting on a decision from the patient. */
  pendingRequests: AccessRequest[];
  /** Grants a provider can read under right now. */
  activeGrants: AccessRequest[];
  refresh: () => Promise<void>;
}

/** Reads the passport store, with the two groupings every screen needs. */
export function usePassportData(): PassportData {
  const { restoring } = useWallet();
  const snapshot = useSyncExternalStore(
    subscribePassportStore,
    getPassportSnapshot,
    getPassportServerSnapshot,
  );

  return useMemo(() => {
    const { accessRequests } = snapshot;
    return {
      loading: restoring || snapshot.status === "loading",
      error: snapshot.error,
      passport: snapshot.passport,
      records: snapshot.records,
      accessRequests,
      auditEvents: snapshot.auditEvents,
      pendingRequests: accessRequests.filter((request) => request.status === "Pending"),
      activeGrants: accessRequests.filter((request) => request.status === "Approved"),
      refresh: refreshPassport,
    };
  }, [snapshot, restoring]);
}
