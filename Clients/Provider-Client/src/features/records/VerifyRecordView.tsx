"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { locka } from "@/lib/locka-client";
import { isHash32, normalizeHash32, sha256Hex } from "@/lib/stellar";
import { errorMessage } from "@/lib/utils";

type Outcome = "match" | "mismatch" | null;

/**
 * Checks a document handed to a provider against the commitment held for its
 * record, which is how a provider can trust a file it did not issue itself.
 */
export function VerifyRecordView() {
  const [recordId, setRecordId] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [hashing, setHashing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function hashFile(file: File) {
    setOutcome(null);
    setHashing(true);
    try {
      setFileHash(await sha256Hex(await file.arrayBuffer()));
      setErrors((current) => ({ ...current, fileHash: undefined }));
    } catch (caught) {
      setErrors({ fileHash: errorMessage(caught) });
    } finally {
      setHashing(false);
    }
  }

  async function handleVerify(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setOutcome(null);

    const nextErrors: Record<string, string | undefined> = {};
    if (!isHash32(recordId)) nextErrors.recordId = "A record id is 64 hex characters.";
    if (!isHash32(fileHash)) nextErrors.fileHash = "Hash the document, or paste its hash.";
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setChecking(true);
    try {
      const matched = await locka.verifyRecordHash(
        normalizeHash32(recordId),
        normalizeHash32(fileHash),
      );
      setOutcome(matched ? "match" : "mismatch");
    } catch (caught) {
      setErrors({ recordId: errorMessage(caught) });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Verify a document"
        description="Confirm that a file you were given is the file that was issued, without trusting whoever handed it over."
      />

      <Card title="Check a file against its record">
        <form onSubmit={handleVerify} className="space-y-5">
          <Input
            label="Record id"
            placeholder="0x…"
            value={recordId}
            spellCheck={false}
            autoComplete="off"
            error={errors.recordId}
            onChange={(event) => {
              setRecordId(event.target.value);
              setOutcome(null);
            }}
            helperText="From the record's on-chain detail, in the patient's passport or your issued records."
            className="font-mono text-xs"
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
            label="Document hash"
            placeholder="0x…"
            value={fileHash}
            spellCheck={false}
            autoComplete="off"
            error={errors.fileHash}
            onChange={(event) => {
              setFileHash(event.target.value);
              setOutcome(null);
            }}
            helperText="SHA-256 of the encrypted document. Hashing happens in this browser, so the file stays on this device."
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

          <Button type="submit" size="lg" loading={checking}>
            Verify
          </Button>
        </form>
      </Card>

      {outcome === "match" && (
        <Callout tone="success" title="Match">
          The document matches the commitment held for this record. It is the file that was issued,
          unchanged.
        </Callout>
      )}

      {outcome === "mismatch" && (
        <Callout tone="danger" title="No match">
          The document does not match the commitment held for this record. It may have been altered,
          or it may belong to a different record.
        </Callout>
      )}
    </div>
  );
}
