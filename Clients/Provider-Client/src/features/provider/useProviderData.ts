"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useWallet } from "@/features/wallet/WalletContext";
import type { AccessRequest, AuditEvent, MedicalRecord, Provider } from "@/lib/domain";
import {
  getProviderServerSnapshot,
  getProviderSnapshot,
  refreshProvider,
  subscribeProviderStore,
} from "./provider-store";

export interface ProviderData {
  /**
   * True while the stored wallet session is being restored, or while the
   * connected account's read is in flight. Screens can treat it as "not ready".
   */
  loading: boolean;
  error: string | null;
  provider: Provider | null;
  /** Only a verified provider may request access or write records. */
  isVerified: boolean;
  accessRequests: AccessRequest[];
  records: MedicalRecord[];
  /** Records readable under each live grant, keyed by passport id. */
  patientRecords: Record<number, MedicalRecord[]>;
  auditEvents: AuditEvent[];
  /** Requests the patient has not answered yet. */
  pendingRequests: AccessRequest[];
  /** Grants this provider can currently read under. */
  liveGrants: AccessRequest[];
  refresh: () => Promise<void>;
}

/** Reads the provider store, with the groupings every screen needs. */
export function useProviderData(): ProviderData {
  const { restoring } = useWallet();
  const snapshot = useSyncExternalStore(
    subscribeProviderStore,
    getProviderSnapshot,
    getProviderServerSnapshot,
  );

  return useMemo(() => {
    const { accessRequests } = snapshot;
    return {
      loading: restoring || snapshot.status === "loading",
      error: snapshot.error,
      provider: snapshot.provider,
      isVerified: snapshot.provider?.status === "Verified",
      accessRequests,
      records: snapshot.records,
      patientRecords: snapshot.patientRecords,
      auditEvents: snapshot.auditEvents,
      pendingRequests: accessRequests.filter((request) => request.status === "Pending"),
      liveGrants: accessRequests.filter((request) => request.status === "Approved"),
      refresh: refreshProvider,
    };
  }, [snapshot, restoring]);
}
