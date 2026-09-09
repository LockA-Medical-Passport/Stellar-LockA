"use client";

import { ProviderGate } from "@/features/provider/ProviderGate";
import { IssuedRecordsView } from "@/features/records/IssuedRecordsView";

export default function IssuedRecordsPage() {
  return (
    <ProviderGate>
      <IssuedRecordsView />
    </ProviderGate>
  );
}
