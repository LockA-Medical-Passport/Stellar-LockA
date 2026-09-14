"use client";

import { PractitionerGate } from "@/features/practitioner/PractitionerGate";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import { AddRecordForm } from "@/features/records/AddRecordForm";

export default function AddRecordPage() {
  return (
    <PractitionerGate requirePractising>
      <AddRecordView />
    </PractitionerGate>
  );
}

function AddRecordView() {
  const { practitioner } = usePractitionerData();
  if (!practitioner) return null;
  return <AddRecordForm practitioner={practitioner} />;
}
