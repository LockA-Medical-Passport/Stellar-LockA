"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { useWallet } from "@/features/wallet/WalletContext";
import { locka } from "@/lib/locka-client";
import { isHash32, isStellarAddress, normalizeHash32, sha256Hex } from "@/lib/stellar";
import { errorMessage } from "@/lib/utils";
import { usePassportData } from "./usePassportData";

/**
 * Registers a passport for the connected account.
 *
 * The identity commitment is derived in the browser from a phrase the patient
 * chooses, so the phrase itself is never transmitted or stored. Only the
 * resulting hash reaches the contract.
 */
export function CreatePassportForm() {
  const router = useRouter();
  const { address } = useWallet();
  const { refresh } = usePassportData();

  const [phrase, setPhrase] = useState("");
  const [identityHash, setIdentityHash] = useState("");
  const [recovery, setRecovery] = useState("");
  const [errors, setErrors] = useState<{ identityHash?: string; recovery?: string }>({});
  const [deriving, setDeriving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function derive() {
    if (!address) return;
    setDeriving(true);
    try {
      setIdentityHash(await sha256Hex(`${address}:${phrase.trim()}`));
      setErrors((current) => ({ ...current, identityHash: undefined }));
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Could not derive a commitment" });
    } finally {
      setDeriving(false);
    }
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!address) return;

    const nextErrors: typeof errors = {};
    if (!isHash32(identityHash)) {
      nextErrors.identityHash = "Derive a commitment, or paste 64 hex characters.";
    }
    const recoveryAddress = recovery.trim();
    if (recoveryAddress && !isStellarAddress(recoveryAddress)) {
      nextErrors.recovery = "Enter a Stellar account address, or leave this empty for now.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const pendingId = toast.pending("Registering your passport on Stellar…");
    try {
      const { passport, txHash } = await locka.createPassport({
        walletAddress: address,
        publicIdentityHash: normalizeHash32(identityHash),
        recoveryAddress: recoveryAddress || null,
      });
      toast.success(`Passport ${passport.passportId} is live.`, {
        title: "Passport created",
        txHash,
      });
      await refresh();
      router.push("/passport");
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Registration failed" });
    } finally {
      dismissToast(pendingId);
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Create your passport"
        description="Two values are written to the network: a commitment that proves the passport is yours, and an optional recovery account."
      />

      <Callout tone="info" title="Nothing medical is written here">
        Registration records an identity commitment and, if you set one, a recovery account. No
        name, document, or clinical detail is published.
      </Callout>

      <Card title="Identity commitment">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Recovery phrase"
            placeholder="A phrase only you know"
            value={phrase}
            autoComplete="off"
            onChange={(event) => setPhrase(event.target.value)}
            helperText="Hashed together with your account address to produce the commitment. It never leaves this device, so keep your own copy."
            trailing={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={deriving}
                disabled={!phrase.trim() || !address}
                onClick={derive}
              >
                Derive
              </Button>
            }
          />

          <Input
            label="Commitment"
            placeholder="0x…"
            value={identityHash}
            spellCheck={false}
            autoComplete="off"
            error={errors.identityHash}
            onChange={(event) => setIdentityHash(event.target.value)}
            helperText="A 32-byte SHA-256 hash. Derive it above, or paste one you generated elsewhere."
            className="font-mono text-xs"
          />

          <Input
            label="Recovery account (optional)"
            placeholder="G…"
            value={recovery}
            spellCheck={false}
            autoComplete="off"
            error={errors.recovery}
            onChange={(event) => setRecovery(event.target.value)}
            helperText="A second account that can help rotate your passport key. You can add it later."
            className="font-mono text-xs"
          />

          <Button type="submit" size="lg" loading={submitting} disabled={!address}>
            Create passport
          </Button>
        </form>
      </Card>
    </div>
  );
}
