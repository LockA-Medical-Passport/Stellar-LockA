"use client";

import { PatientDetail } from "@/features/patients/PatientDetail";
import { PractitionerGate } from "@/features/practitioner/PractitionerGate";

export function PatientDetailScreen({ passportId }: { passportId: number }) {
  return (
    <PractitionerGate>
      <PatientDetail passportId={passportId} />
    </PractitionerGate>
  );
}
