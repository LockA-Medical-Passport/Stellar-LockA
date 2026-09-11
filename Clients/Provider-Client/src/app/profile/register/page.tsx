"use client";

import { LoadingPanel } from "@/features/practitioner/PractitionerGate";
import { PractitionerProfile } from "@/features/practitioner/PractitionerProfile";
import { RegisterPractitionerForm } from "@/features/practitioner/RegisterPractitionerForm";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import { ConnectPrompt } from "@/features/wallet/ConnectPrompt";
import { useWallet } from "@/features/wallet/WalletContext";

export default function RegisterPractitionerPage() {
  const { address } = useWallet();
  const { loading, practitioner } = usePractitionerData();

  if (loading) return <LoadingPanel />;
  if (!address) {
    return (
      <ConnectPrompt
        title="Connect an account first"
        description="Your registration is held under a Stellar account, so connect the account you want to sign your records with."
      />
    );
  }
  // Already registered: show the profile rather than a form that would fail.
  if (practitioner) return <PractitionerProfile practitioner={practitioner} />;

  return <RegisterPractitionerForm />;
}
