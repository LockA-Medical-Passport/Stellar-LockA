"use client";

import { RequestAccessForm } from "@/features/access/RequestAccessForm";
import { PractitionerGate } from "@/features/practitioner/PractitionerGate";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";

export default function RequestAccessPage() {
  return (
    <PractitionerGate requirePractising>
      <RequestAccessView />
    </PractitionerGate>
  );
}

function RequestAccessView() {
  const { practitioner } = usePractitionerData();
  if (!practitioner) return null;
  return <RequestAccessForm practitioner={practitioner} />;
}
