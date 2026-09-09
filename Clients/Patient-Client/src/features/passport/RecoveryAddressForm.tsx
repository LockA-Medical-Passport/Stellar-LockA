"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { isStellarAddress } from "@/lib/stellar";
import { locka } from "@/lib/locka-client";
import { errorMessage } from "@/lib/utils";
import { usePassportData } from "./usePassportData";

export interface RecoveryAddressFormProps {
  passportId: number;
  current: string | null;
}

/**
 * Sets the account allowed to help rotate the passport's wallet key, which is
 * the only route back in if the primary account is lost.
 */
export function RecoveryAddressForm({ passportId, current }: RecoveryAddressFormProps) {
  const { refresh } = usePassportData();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(undefined);

    const address = value.trim();
    if (!isStellarAddress(address)) {
      setError("Enter a Stellar account address: 56 characters, starting with G.");
      return;
    }
    if (address === current) {
      setError("That is already your recovery account.");
      return;
    }

    setSaving(true);
    const pendingId = toast.pending("Updating your recovery account…");
    try {
      const { txHash } = await locka.updateRecoveryAddress(passportId, address);
      toast.success("Recovery account updated.", { title: "Passport updated", txHash });
      setValue("");
      await refresh();
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Update failed" });
    } finally {
      dismissToast(pendingId);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={current ? "New recovery account" : "Recovery account"}
        placeholder="G…"
        value={value}
        spellCheck={false}
        autoComplete="off"
        error={error}
        onChange={(event) => setValue(event.target.value)}
        helperText="A second Stellar account you control. Keep it somewhere separate from your day-to-day wallet."
        className="font-mono text-xs"
      />
      <Button type="submit" loading={saving} disabled={!value.trim()}>
        {current ? "Replace recovery account" : "Set recovery account"}
      </Button>
    </form>
  );
}
