"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useWallet } from "@/features/wallet/WalletContext";
import type { AccessRequest, AuditEvent, MedicalRecord, Practitioner } from "@/lib/domain";
import {
  getPractitionerServerSnapshot,
  getPractitionerSnapshot,
  refreshPractitioner,
  subscribePractitionerStore,
} from "./practitioner-store";

export interface PractitionerData {
  /**
   * True while the stored wallet session is being restored, or while the
   * connected account's read is in flight. Screens can treat it as "not ready".
   */
  loading: boolean;
  error: string | null;
  practitioner: Practitioner | null;
  /** A registration in good standing may request access and issue records. */
  canPractise: boolean;
  accessRequests: AccessRequest[];
  records: MedicalRecord[];
  /** Records readable under each live grant, keyed by passport id. */
  patientRecords: Record<number, MedicalRecord[]>;
  auditEvents: AuditEvent[];
  /** Requests the patient has not answered yet. */
  pendingRequests: AccessRequest[];
  /** Grants this practitioner can currently read under. */
  liveGrants: AccessRequest[];
  refresh: () => Promise<void>;
}

/** Reads the practitioner store, with the groupings every screen needs. */
export function usePractitionerData(): PractitionerData {
  const { restoring } = useWallet();
  const snapshot = useSyncExternalStore(
    subscribePractitionerStore,
    getPractitionerSnapshot,
    getPractitionerServerSnapshot,
  );

  return useMemo(() => {
    const { accessRequests } = snapshot;
    return {
      loading: restoring || snapshot.status === "loading",
      error: snapshot.error,
      practitioner: snapshot.practitioner,
      canPractise: snapshot.practitioner?.status === "Verified",
      accessRequests,
      records: snapshot.records,
      patientRecords: snapshot.patientRecords,
      auditEvents: snapshot.auditEvents,
      pendingRequests: accessRequests.filter((request) => request.status === "Pending"),
      liveGrants: accessRequests.filter((request) => request.status === "Approved"),
      refresh: refreshPractitioner,
    };
  }, [snapshot, restoring]);
}
