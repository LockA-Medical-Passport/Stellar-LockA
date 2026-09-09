"use client";

import { LoadingPanel } from "@/features/provider/ProviderGate";
import { ProviderProfile } from "@/features/provider/ProviderProfile";
import { RegisterProviderForm } from "@/features/provider/RegisterProviderForm";
import { useProviderData } from "@/features/provider/useProviderData";
import { ConnectPrompt } from "@/features/wallet/ConnectPrompt";
import { useWallet } from "@/features/wallet/WalletContext";

export default function RegisterProviderPage() {
  const { address } = useWallet();
  const { loading, provider } = useProviderData();

  if (loading) return <LoadingPanel />;
  if (!address) {
    return (
      <ConnectPrompt
        title="Connect an account first"
        description="Your organisation is registered against a Stellar account, so connect the account it should be held under."
      />
    );
  }
  // Already registered: show the profile rather than a form that would fail.
  if (provider) return <ProviderProfile provider={provider} />;

  return <RegisterProviderForm />;
}
