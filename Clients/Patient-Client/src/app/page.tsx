"use client";

import { Callout } from "@/components/ui/Callout";
import { LoadingPanel, NoPassportPrompt } from "@/features/passport/PassportGate";
import { usePassportData } from "@/features/passport/usePassportData";
import { OverviewDashboard } from "@/features/overview/OverviewDashboard";
import { PublicLanding } from "@/features/overview/PublicLanding";
import { useWallet } from "@/features/wallet/WalletContext";

export default function OverviewPage() {
  const { address } = useWallet();
  const { loading, error, passport } = usePassportData();

  // Checked before `loading` on purpose: the landing page is the public face of
  // LockA, so it renders on the server rather than behind a restore skeleton.
  if (!address) return <PublicLanding />;
  if (loading) return <LoadingPanel />;

  if (error) {
    return (
      <Callout tone="danger" title="Could not read your passport">
        {error}
      </Callout>
    );
  }

  if (!passport) return <NoPassportPrompt />;

  return <OverviewDashboard passport={passport} />;
}
