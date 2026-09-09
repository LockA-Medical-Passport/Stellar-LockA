"use client";

import { ProviderGate } from "@/features/provider/ProviderGate";
import { useProviderData } from "@/features/provider/useProviderData";
import { AddRecordForm } from "@/features/records/AddRecordForm";

export default function AddRecordPage() {
  return (
    <ProviderGate requireVerified>
      <AddRecordView />
    </ProviderGate>
  );
}

function AddRecordView() {
  const { provider } = useProviderData();
  if (!provider) return null;
  return <AddRecordForm provider={provider} />;
}
