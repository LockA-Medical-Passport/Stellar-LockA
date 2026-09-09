"use client";

import { AccessView } from "@/features/access/AccessView";
import { ProviderGate } from "@/features/provider/ProviderGate";

export default function AccessPage() {
  return (
    <ProviderGate>
      <AccessView />
    </ProviderGate>
  );
}
