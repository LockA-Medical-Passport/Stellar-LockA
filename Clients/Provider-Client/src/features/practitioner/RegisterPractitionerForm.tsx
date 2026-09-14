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
import {
  ORGANIZATION_TYPE_OPTIONS,
  PRACTITIONER_ROLE_OPTIONS,
  formatPractitionerId,
  type OrganizationType,
  type PractitionerRole,
} from "@/lib/domain";
import { locka } from "@/lib/locka-client";
import { sha256Hex } from "@/lib/stellar";
import { errorMessage } from "@/lib/utils";
import { usePractitionerData } from "./usePractitionerData";

/**
 * Registers an individual practitioner.
 *
 * Three things identify a practitioner on LockA: their full government name,
 * their practising licence number, and the organisation they work under. The
 * registry mints a practitioner id from those details, and that id is what gets
 * stamped on every record they go on to issue.
 *
 * The licence number is hashed in the browser so a commitment can be anchored
 * on-chain while the number itself, like the name, stays off-chain with
 * locka-api under the platform's no-PII-on-ledger rule.
 */
export function RegisterPractitionerForm() {
  const router = useRouter();
  const { address } = useWallet();
  const { refresh } = usePractitionerData();

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<PractitionerRole>("Doctor");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState<OrganizationType>("Hospital");
  const [country, setCountry] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!address) return;

    const nextErrors: Record<string, string | undefined> = {};
    if (fullName.trim().split(/\s+/).length < 2) {
      nextErrors.fullName = "Enter your full name as it appears on your practising licence.";
    }
    if (!licenseNumber.trim()) {
      nextErrors.licenseNumber = "Enter your practising licence number.";
    }
    if (!organizationName.trim()) {
      nextErrors.organizationName = "Enter the organisation you practise under.";
    }
    if (!country.trim()) nextErrors.country = "Enter the country you are licensed in.";
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    const pendingId = toast.pending("Registering you on Stellar…");
    try {
      const licenseHash = await sha256Hex(licenseNumber.trim());
      const { practitioner, txHash } = await locka.registerPractitioner({
        address,
        fullName: fullName.trim(),
        role,
        licenseNumber: licenseNumber.trim(),
        licenseHash,
        organizationName: organizationName.trim(),
        organizationType,
        country: country.trim(),
      });
      toast.success(
        `You are registered as ${formatPractitionerId(practitioner.practitionerId)}. This id is stamped on every record you issue.`,
        { title: "Registered", txHash },
      );
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
        title="Register as a practitioner"
        description="LockA registers people, not buildings. Your registration is yours, and it records the organisation you practise under."
      />

      <Callout tone="info" title="Approved automatically for now">
        Registration takes effect immediately, so you can start work as soon as it lands.
        Administrator review of licence details is the step this makes room for, and a suspended or
        revoked registration blocks access requests and record writing.
      </Callout>

      <Card title="Your details">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full government name"
            placeholder="Amara Chinelo Nwosu"
            value={fullName}
            error={errors.fullName}
            autoComplete="name"
            onChange={(event) => setFullName(event.target.value)}
            helperText="Exactly as it appears on your practising licence. Patients see this name on every request and record."
            required
          />

          <Select
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value as PractitionerRole)}
            options={PRACTITIONER_ROLE_OPTIONS}
            helperText="What you are licensed to practise as."
            required
          />

          <Input
            label="Practising licence number"
            placeholder="MDCN/R/58214"
            value={licenseNumber}
            spellCheck={false}
            autoComplete="off"
            error={errors.licenseNumber}
            onChange={(event) => setLicenseNumber(event.target.value)}
            helperText="As issued by your professional council, so it can be checked against their register. Only a hash of it is written on-chain."
            className="font-mono text-xs"
            required
          />

          <Input
            label="Organisation you work with"
            placeholder="Lagos General Hospital"
            value={organizationName}
            error={errors.organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            helperText="Where you currently practise. Recorded against your registration, and shown to patients alongside your name."
            required
          />

          <Select
            label="Organisation type"
            value={organizationType}
            onChange={(event) => setOrganizationType(event.target.value as OrganizationType)}
            options={ORGANIZATION_TYPE_OPTIONS}
            required
          />

          <Input
            label="Country"
            placeholder="Nigeria"
            value={country}
            error={errors.country}
            onChange={(event) => setCountry(event.target.value)}
            helperText="The country whose council issued your licence."
            required
          />

          <Button type="submit" size="lg" loading={submitting} disabled={!address}>
            Register and mint my practitioner id
          </Button>
        </form>
      </Card>
    </div>
  );
}
