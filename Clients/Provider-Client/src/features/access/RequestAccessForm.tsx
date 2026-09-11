"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import {
  PASSPORT_STATUS_LABELS,
  PASSPORT_STATUS_VARIANTS,
  RECORD_SCOPE_DESCRIPTIONS,
  RECORD_SCOPE_OPTIONS,
  formatPassportId,
  parsePassportId,
  formatPractitionerId,
  type Practitioner,
  type RecordScope,
} from "@/lib/domain";
import { ACCESS_DURATION_OPTIONS, formatDuration } from "@/lib/format";
import { locka, type PassportLookup } from "@/lib/locka-client";
import { errorMessage } from "@/lib/utils";

/**
 * Sends a consent request for one patient, one record category, and one window.
 *
 * The passport id is checked first so a typo fails here rather than as a
 * request the patient has to reject.
 */
export function RequestAccessForm({ practitioner }: { practitioner: Practitioner }) {
  const router = useRouter();
  const { refresh } = usePractitionerData();

  const [passportInput, setPassportInput] = useState("");
  const [lookup, setLookup] = useState<PassportLookup | null>(null);
  const [looking, setLooking] = useState(false);
  const [scope, setScope] = useState<RecordScope>("EmergencySummaryOnly");
  const [duration, setDuration] = useState("86400");
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleLookup() {
    const passportId = parsePassportId(passportInput);
    setLookup(null);
    if (passportId === null) {
      setErrors({ passportId: "Enter a passport id, such as LP-010427 or 10427." });
      return;
    }
    setErrors({});
    setLooking(true);
    try {
      const found = await locka.lookupPassport(passportId);
      if (!found) {
        setErrors({ passportId: "No passport exists with that id." });
        return;
      }
      setLookup(found);
    } catch (caught) {
      setErrors({ passportId: errorMessage(caught) });
    } finally {
      setLooking(false);
    }
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const passportId = parsePassportId(passportInput);
    const nextErrors: Record<string, string | undefined> = {};
    if (passportId === null) nextErrors.passportId = "Enter a valid passport id.";
    if (!purpose.trim()) {
      nextErrors.purpose = "Say why you need the records. The patient reads this before deciding.";
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean) || passportId === null) return;

    setSubmitting(true);
    const pendingId = toast.pending("Sending the request…");
    try {
      const { request, txHash } = await locka.requestAccess({
        practitionerId: practitioner.practitionerId,
        passportId,
        recordScope: scope,
        durationSeconds: Number(duration),
        purpose: purpose.trim(),
      });
      toast.success(
        `Request #${request.accessId} sent to ${formatPassportId(passportId)}. Nothing opens until the patient approves it.`,
        { title: "Request sent", txHash },
      );
      await refresh();
      router.push("/access");
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Request failed" });
    } finally {
      dismissToast(pendingId);
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Request access"
        description="Ask for one record category, for one window, with a reason the patient can weigh."
      />

      <Callout tone="info" title="Ask for the minimum the visit needs">
        A narrow request is approved faster and keeps you inside the platform&apos;s
        minimum-disclosure rule. Patients can also grant less than you ask for.
      </Callout>

      <Callout tone="success" title="The patient will see who is asking">
        This request goes out as{" "}
        <strong className="font-medium text-foreground">{practitioner.fullName}</strong>,{" "}
        <span className="font-mono text-locka-cyan">
          {formatPractitionerId(practitioner.practitionerId)}
        </span>
        , at {practitioner.organizationName}.
      </Callout>

      <Card title="Request">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Patient passport id"
            placeholder="LP-010427"
            value={passportInput}
            spellCheck={false}
            autoComplete="off"
            error={errors.passportId}
            onChange={(event) => {
              setPassportInput(event.target.value);
              setLookup(null);
            }}
            helperText="From the patient's passport, shared in person or by QR code."
            trailing={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={looking}
                disabled={!passportInput.trim()}
                onClick={handleLookup}
              >
                Check
              </Button>
            }
          />

          {lookup && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-green/25 bg-brand-green/8 p-3">
              <span className="font-mono text-sm text-foreground">
                {formatPassportId(lookup.passportId)}
              </span>
              <Badge variant={PASSPORT_STATUS_VARIANTS[lookup.status]}>
                {PASSPORT_STATUS_LABELS[lookup.status]}
              </Badge>
              <span className="text-xs text-foreground/50">
                Found. Nothing about this patient is readable until they approve.
              </span>
            </div>
          )}

          <Select
            label="Record category"
            value={scope}
            onChange={(event) => setScope(event.target.value as RecordScope)}
            options={RECORD_SCOPE_OPTIONS}
            helperText={RECORD_SCOPE_DESCRIPTIONS[scope]}
            required
          />

          <Select
            label="Access window"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            options={ACCESS_DURATION_OPTIONS}
            helperText={`Access closes automatically after ${formatDuration(Number(duration))}.`}
            required
          />

          <Textarea
            label="Reason for the request"
            placeholder="Pre-operative assessment ahead of scheduled surgery on Thursday."
            value={purpose}
            error={errors.purpose}
            onChange={(event) => setPurpose(event.target.value)}
            helperText="Shown to the patient verbatim."
            required
          />

          <Button type="submit" size="lg" loading={submitting}>
            Send request
          </Button>
        </form>
      </Card>
    </div>
  );
}
