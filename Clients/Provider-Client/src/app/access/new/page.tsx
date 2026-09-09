"use client";

import { RequestAccessForm } from "@/features/access/RequestAccessForm";
import { ProviderGate } from "@/features/provider/ProviderGate";
import { useProviderData } from "@/features/provider/useProviderData";

export default function RequestAccessPage() {
  return (
    <ProviderGate requireVerified>
      <RequestAccessView />
    </ProviderGate>
  );
}

function RequestAccessView() {
  const { provider } = useProviderData();
  if (!provider) return null;
  return <RequestAccessForm provider={provider} />;
}
