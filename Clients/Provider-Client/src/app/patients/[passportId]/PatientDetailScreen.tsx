"use client";

import { PatientDetail } from "@/features/patients/PatientDetail";
import { ProviderGate } from "@/features/provider/ProviderGate";

export function PatientDetailScreen({ passportId }: { passportId: number }) {
  return (
    <ProviderGate>
      <PatientDetail passportId={passportId} />
    </ProviderGate>
  );
}
