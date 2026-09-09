"use client";

import { PassportGate } from "@/features/passport/PassportGate";
import { RecordsView } from "@/features/records/RecordsView";

export default function RecordsPage() {
  return (
    <PassportGate>
      <RecordsView />
    </PassportGate>
  );
}
