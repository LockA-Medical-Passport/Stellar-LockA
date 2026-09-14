"use client";

import { PatientsView } from "@/features/patients/PatientsView";
import { PractitionerGate } from "@/features/practitioner/PractitionerGate";

export default function PatientsPage() {
  return (
    <PractitionerGate>
      <PatientsView />
    </PractitionerGate>
  );
}
