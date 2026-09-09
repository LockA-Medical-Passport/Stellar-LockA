"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { locka } from "@/lib/locka-client";
import { isHash32, normalizeHash32, sha256Hex } from "@/lib/stellar";
import { errorMessage } from "@/lib/utils";

type Outcome = "match" | "mismatch" | null;

export interface VerifyHashFieldProps {
  recordId: string;
}

/**
 * Checks a document against the commitment stored for a record.
 *
 * A file can be hashed here in the browser, which keeps the document itself on
 * the device: only the resulting SHA-256 commitment is compared.
 */
export function VerifyHashField({ recordId }: VerifyHashFieldProps) {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function reset() {
    setOutcome(null);
    setError(null);
  }

  async function handleFile(file: File) {
    reset();
    setHashing(true);
    try {
      setValue(await sha256Hex(await file.arrayBuffer()));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setHashing(false);
    }
  }

  async function handleVerify() {
    reset();
    if (!isHash32(value)) {
      setError("Enter a 32-byte hash as 64 hex characters, or pick a file to hash.");
      return;
    }
    setChecking(true);
    try {
      const matched = await locka.verifyRecordHash(recordId, normalizeHash32(value));
      setOutcome(matched ? "match" : "mismatch");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={value}
          spellCheck={false}
          placeholder="0x… file hash"
          onChange={(event) => {
            setValue(event.target.value);
            reset();
          }}
          aria-label="File hash to verify"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-navy-800/60 px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-foreground/40 focus:border-locka-cyan/50 focus:ring-2 focus:ring-locka-cyan/50 focus:outline-none"
        />
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          loading={hashing}
          onClick={() => fileInput.current?.click()}
        >
          Hash a file
        </Button>
        <Button size="sm" loading={checking} disabled={!value} onClick={handleVerify}>
          Verify
        </Button>
      </div>

      {outcome === "match" && (
        <p className="flex items-center gap-2 text-xs text-brand-green">
          <Badge variant="green">Match</Badge>
          This file is the one that was issued, unchanged.
        </p>
      )}
      {outcome === "mismatch" && (
        <p className="flex items-center gap-2 text-xs text-brand-red">
          <Badge variant="red">No match</Badge>
          This file does not match the commitment held for this record.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-brand-red">
          {error}
        </p>
      )}
    </div>
  );
}
