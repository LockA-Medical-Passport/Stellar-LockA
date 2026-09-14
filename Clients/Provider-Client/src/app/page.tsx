"use client";

import { Callout } from "@/components/ui/Callout";
import { PractitionerLanding } from "@/features/overview/PractitionerLanding";
import { PractitionerOverview } from "@/features/overview/PractitionerOverview";
import { LoadingPanel, NotRegisteredPrompt } from "@/features/practitioner/PractitionerGate";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import { useWallet } from "@/features/wallet/WalletContext";

export default function OverviewPage() {
  const { address } = useWallet();
  const { loading, error, practitioner } = usePractitionerData();

  // Checked before `loading` on purpose: this is the portal's front door, so it
  // renders on the server rather than behind a restore skeleton.
  if (!address) return <PractitionerLanding />;
  if (loading) return <LoadingPanel />;

  if (error) {
    return (
      <Callout tone="danger" title="Could not read your registration">
        {error}
      </Callout>
    );
  }

  if (!practitioner) return <NotRegisteredPrompt />;

  return <PractitionerOverview practitioner={practitioner} />;
}
