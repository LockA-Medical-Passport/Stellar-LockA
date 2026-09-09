"use client";

import { ConsentView } from "@/features/consent/ConsentView";
import { PassportGate } from "@/features/passport/PassportGate";

export default function ConsentPage() {
  return (
    <PassportGate>
      <ConsentView />
    </PassportGate>
  );
}
