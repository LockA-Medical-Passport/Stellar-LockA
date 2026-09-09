"use client";

import { PatientsView } from "@/features/patients/PatientsView";
import { ProviderGate } from "@/features/provider/ProviderGate";

export default function PatientsPage() {
  return (
    <ProviderGate>
      <PatientsView />
    </ProviderGate>
  );
}
