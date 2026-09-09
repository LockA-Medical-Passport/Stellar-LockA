"use client";

import { Callout } from "@/components/ui/Callout";
import { ProviderLanding } from "@/features/overview/ProviderLanding";
import { ProviderOverview } from "@/features/overview/ProviderOverview";
import { LoadingPanel, NotRegisteredPrompt } from "@/features/provider/ProviderGate";
import { useProviderData } from "@/features/provider/useProviderData";
import { useWallet } from "@/features/wallet/WalletContext";

export default function OverviewPage() {
  const { address } = useWallet();
  const { loading, error, provider } = useProviderData();

  // Checked before `loading` on purpose: this is the portal's front door, so it
  // renders on the server rather than behind a restore skeleton.
  if (!address) return <ProviderLanding />;
  if (loading) return <LoadingPanel />;

  if (error) {
    return (
      <Callout tone="danger" title="Could not read your organisation">
        {error}
      </Callout>
    );
  }

  if (!provider) return <NotRegisteredPrompt />;

  return <ProviderOverview provider={provider} />;
}
