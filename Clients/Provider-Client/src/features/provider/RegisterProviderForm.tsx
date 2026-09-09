"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { useWallet } from "@/features/wallet/WalletContext";
import { PROVIDER_TYPE_OPTIONS, type ProviderType } from "@/lib/domain";
import { locka } from "@/lib/locka-client";
import { isHash32, normalizeHash32, sha256Hex } from "@/lib/stellar";
import { errorMessage } from "@/lib/utils";
import { useProviderData } from "./useProviderData";

/**
 * Registers an organisation in the provider registry.
 *
 * The licence number is hashed in the browser, so the number itself is never
 * transmitted: the registry holds only the commitment, which an administrator
 * checks against the credential submitted out of band.
 */
export function RegisterProviderForm() {
  const router = useRouter();
  const { address } = useWallet();
  const { refresh } = useProviderData();

  const [name, setName] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("Hospital");
  const [country, setCountry] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseHash, setLicenseHash] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [hashing, setHashing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function hashLicense() {
    setHashing(true);
    try {
      setLicenseHash(await sha256Hex(licenseNumber.trim()));
      setErrors((current) => ({ ...current, licenseHash: undefined }));
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Could not hash the licence" });
    } finally {
      setHashing(false);
    }
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!address) return;

    const nextErrors: Record<string, string | undefined> = {};
    if (!name.trim()) nextErrors.name = "Enter the organisation's registered name.";
    if (!country.trim()) nextErrors.country = "Enter the country it operates in.";
    if (!isHash32(licenseHash)) {
      nextErrors.licenseHash = "Hash a licence number, or paste 64 hex characters.";
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    const pendingId = toast.pending("Registering your organisation on Stellar…");
    try {
      const { provider, txHash } = await locka.registerProvider({
        address,
        name: name.trim(),
        providerType,
        country: country.trim(),
        licenseHash: normalizeHash32(licenseHash),
      });
      toast.success(`${provider.name} is registered and awaiting verification.`, {
        title: "Registration submitted",
        txHash,
      });
      await refresh();
      router.push("/profile");
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
        title="Register organisation"
        description="Registration puts your organisation in the registry as pending. An administrator verifies it before you can request patient access."
      />

      <Callout tone="info" title="Your licence number stays with you">
        Only a hash of the licence number is written to the registry. Submit the credential itself
        through your usual verification channel.
      </Callout>

      <Card title="Organisation details">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Registered name"
            placeholder="Lagos General Hospital"
            value={name}
            error={errors.name}
            onChange={(event) => setName(event.target.value)}
            helperText="Patients see this name on every access request you send."
            required
          />

          <Select
            label="Category"
            value={providerType}
            onChange={(event) => setProviderType(event.target.value as ProviderType)}
            options={PROVIDER_TYPE_OPTIONS}
            helperText="Determines which record categories you would normally be granted."
            required
          />

          <Input
            label="Country"
            placeholder="Nigeria"
            value={country}
            error={errors.country}
            onChange={(event) => setCountry(event.target.value)}
            required
          />

          <Input
            label="Licence number"
            placeholder="Practising or facility licence"
            value={licenseNumber}
            autoComplete="off"
            onChange={(event) => setLicenseNumber(event.target.value)}
            helperText="Hashed in this browser. The number itself is never sent."
            trailing={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={hashing}
                disabled={!licenseNumber.trim()}
                onClick={hashLicense}
              >
                Hash
              </Button>
            }
          />

          <Input
            label="Licence commitment"
            placeholder="0x…"
            value={licenseHash}
            spellCheck={false}
            autoComplete="off"
            error={errors.licenseHash}
            onChange={(event) => setLicenseHash(event.target.value)}
            helperText="A 32-byte SHA-256 hash. Hash it above, or paste one you generated elsewhere."
            className="font-mono text-xs"
          />

          <Button type="submit" size="lg" loading={submitting} disabled={!address}>
            Submit registration
          </Button>
        </form>
      </Card>
    </div>
  );
}
