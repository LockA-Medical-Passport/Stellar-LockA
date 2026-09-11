"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { dismissToast, toast } from "@/components/ui/toast-store";
import { usePractitionerData } from "@/features/practitioner/usePractitionerData";
import {
  RECORD_TYPE_OPTIONS,
  formatPassportId,
  formatPractitionerId,
  type Practitioner,
  type RecordType,
} from "@/lib/domain";
import { formatRelative } from "@/lib/format";
import { locka } from "@/lib/locka-client";
import { isHash32, normalizeHash32, sha256Hex } from "@/lib/stellar";
import { errorMessage } from "@/lib/utils";

/**
 * Writes a record commitment to a patient's passport.
 *
 * The document itself belongs in the encrypted vault; what is anchored here is
 * the hash of the encrypted file and the hash of its storage pointer. Hashing
 * the file in this browser means the plaintext never transits the client.
 */
export function AddRecordForm({ practitioner }: { practitioner: Practitioner }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { liveGrants, refresh } = usePractitionerData();

  const grantOptions = liveGrants.map((grant) => ({
    value: String(grant.passportId),
    label: `${formatPassportId(grant.passportId)} — expires ${formatRelative(grant.expiresAt)}`,
  }));

  const requested = searchParams.get("passport");
  const [passportId, setPassportId] = useState(
    requested && grantOptions.some((option) => option.value === requested)
      ? requested
      : (grantOptions[0]?.value ?? ""),
  );
  const [recordType, setRecordType] = useState<RecordType>("Diagnosis");
  const [title, setTitle] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [pointerHash, setPointerHash] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [hashing, setHashing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  if (liveGrants.length === 0) {
    return (
      <div className="animate-fade-in space-y-6">
        <PageHeader title="Add record" />
        <Card>
          <EmptyState
            title="No live grant to write against"
            description="A record can only be added while a patient has an open grant for you. Request access and wait for them to approve it."
            action={<LinkButton href="/access/new">Request access</LinkButton>}
          />
        </Card>
      </div>
    );
  }

  async function hashFile(file: File) {
    setHashing(true);
    try {
      setFileHash(await sha256Hex(await file.arrayBuffer()));
      setErrors((current) => ({ ...current, fileHash: undefined }));
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Could not hash the file" });
    } finally {
      setHashing(false);
    }
  }

  async function derivePointer() {
    setPointerHash(
      await sha256Hex(`vault:${practitioner.practitionerId}:${passportId}:${Date.now()}`),
    );
    setErrors((current) => ({ ...current, pointerHash: undefined }));
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();

    const nextErrors: Record<string, string | undefined> = {};
    if (!title.trim()) nextErrors.title = "Give the record a title the patient will recognise.";
    if (!isHash32(fileHash))
      nextErrors.fileHash = "Hash the encrypted document, or paste its hash.";
    if (!isHash32(pointerHash)) {
      nextErrors.pointerHash = "Derive a storage pointer hash, or paste one.";
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    const pendingId = toast.pending("Anchoring the record on Stellar…");
    try {
      const { txHash } = await locka.addRecord({
        practitionerId: practitioner.practitionerId,
        passportId: Number(passportId),
        recordType,
        title: title.trim(),
        encryptedFileHash: normalizeHash32(fileHash),
        storagePointerHash: normalizeHash32(pointerHash),
      });
      toast.success(`“${title.trim()}” added to ${formatPassportId(Number(passportId))}.`, {
        title: "Record added",
        txHash,
      });
      await refresh();
      router.push("/records");
    } catch (caught) {
      toast.error(errorMessage(caught), { title: "Could not add the record" });
    } finally {
      dismissToast(pendingId);
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Add record"
        description="Anchor a record against a passport you hold a live grant for."
      />

      <Callout tone="info" title="Only hashes are written to the network">
        Encrypt the document and store it in the health vault. What lands on Stellar is the hash of
        that encrypted file and the hash of its storage pointer.
      </Callout>

      <Callout tone="success" title="Signed as you">
        This record is stamped with{" "}
        <strong className="font-medium text-foreground">
          {formatPractitionerId(practitioner.practitionerId)}
        </strong>
        , so the patient and any later practitioner can trace it back to {practitioner.fullName} at{" "}
        {practitioner.organizationName}.
      </Callout>

      <Card title="Record">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Patient"
            value={passportId}
            onChange={(event) => setPassportId(event.target.value)}
            options={grantOptions}
            helperText="Only passports with an open grant for you are listed."
            required
          />

          <Select
            label="Category"
            value={recordType}
            onChange={(event) => setRecordType(event.target.value as RecordType)}
            options={RECORD_TYPE_OPTIONS}
            required
          />

          <Input
            label="Title"
            placeholder="Full blood count"
            value={title}
            error={errors.title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />

          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void hashFile(file);
              event.target.value = "";
            }}
          />

          <Input
            label="Encrypted file hash"
            placeholder="0x…"
            value={fileHash}
            spellCheck={false}
            autoComplete="off"
            error={errors.fileHash}
            onChange={(event) => setFileHash(event.target.value)}
            helperText="SHA-256 of the encrypted document. Hashing happens in this browser."
            className="font-mono text-xs"
            trailing={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={hashing}
                onClick={() => fileInput.current?.click()}
              >
                Hash a file
              </Button>
            }
          />

          <Input
            label="Storage pointer hash"
            placeholder="0x…"
            value={pointerHash}
            spellCheck={false}
            autoComplete="off"
            error={errors.pointerHash}
            onChange={(event) => setPointerHash(event.target.value)}
            helperText="SHA-256 of the vault key or IPFS CID, so the pointer itself stays private."
            className="font-mono text-xs"
            trailing={
              <Button type="button" variant="secondary" size="sm" onClick={derivePointer}>
                Derive
              </Button>
            }
          />

          <Button type="submit" size="lg" loading={submitting}>
            Add record
          </Button>
        </form>
      </Card>
    </div>
  );
}
