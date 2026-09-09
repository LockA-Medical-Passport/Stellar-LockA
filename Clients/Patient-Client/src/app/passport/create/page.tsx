"use client";

import { CreatePassportForm } from "@/features/passport/CreatePassportForm";
import { LoadingPanel } from "@/features/passport/PassportGate";
import { usePassportData } from "@/features/passport/usePassportData";
import { PassportDetail } from "@/features/passport/PassportDetail";
import { ConnectPrompt } from "@/features/wallet/ConnectPrompt";
import { useWallet } from "@/features/wallet/WalletContext";

export default function CreatePassportPage() {
  const { address } = useWallet();
  const { loading, passport } = usePassportData();

  if (loading) return <LoadingPanel />;
  if (!address) {
    return (
      <ConnectPrompt
        title="Connect an account first"
        description="A passport is registered to a Stellar account, so connect the account you want to hold it."
      />
    );
  }
  // Already registered: show the passport rather than a form that would fail.
  if (passport) return <PassportDetail passport={passport} />;

  return <CreatePassportForm />;
}
