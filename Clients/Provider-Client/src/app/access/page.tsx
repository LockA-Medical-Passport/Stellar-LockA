"use client";

import { AccessView } from "@/features/access/AccessView";
import { PractitionerGate } from "@/features/practitioner/PractitionerGate";

export default function AccessPage() {
  return (
    <PractitionerGate>
      <AccessView />
    </PractitionerGate>
  );
}
