"use client";

import { ProviderGate } from "@/features/provider/ProviderGate";
import { ProviderProfile } from "@/features/provider/ProviderProfile";
import { useProviderData } from "@/features/provider/useProviderData";

export default function ProfilePage() {
  return (
    <ProviderGate>
      <ProfileView />
    </ProviderGate>
  );
}

function ProfileView() {
  const { provider } = useProviderData();
  if (!provider) return null;
  return <ProviderProfile provider={provider} />;
}
