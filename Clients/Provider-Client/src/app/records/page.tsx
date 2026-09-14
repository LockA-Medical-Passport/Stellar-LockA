"use client";

import { PractitionerGate } from "@/features/practitioner/PractitionerGate";
import { IssuedRecordsView } from "@/features/records/IssuedRecordsView";

export default function IssuedRecordsPage() {
  return (
    <PractitionerGate>
      <IssuedRecordsView />
    </PractitionerGate>
  );
}
