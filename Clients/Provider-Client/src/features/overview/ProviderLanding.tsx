"use client";

import { LockaWordmark } from "@/components/layout/LockaLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWallet } from "@/features/wallet/WalletContext";
import { networkLabel } from "@/lib/config";

const CAPABILITIES = [
  {
    title: "Ask, don't chase",
    body: "Request one record category for one window. The patient sees who is asking, what would open, and why, then decides.",
  },
  {
    title: "History you can rely on",
    body: "Read allergies, diagnoses, prescriptions, lab results, and vaccination records the patient already holds, instead of repeating tests.",
  },
  {
    title: "Issue verifiable records",
    body: "Write a record against a passport and anchor its hash, so any later provider can prove the document is the one you issued.",
  },
  {
    title: "Checkable documents",
    body: "Hash a file you were handed and compare it against the record's commitment before you act on it.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Register your organisation",
    body: "Submit your name, category, country, and a licence commitment. Only the hash of the licence number reaches the registry.",
  },
  {
    step: "02",
    title: "Get verified",
    body: "An administrator reviews the submission and verifies the organisation in the provider registry.",
  },
  {
    step: "03",
    title: "Request patient access",
    body: "Send a request against a passport id. Nothing is readable until the patient approves it.",
  },
  {
    step: "04",
    title: "Read and write within scope",
    body: "Read what the grant covers, add records while it is open, and hand access back when the episode of care ends.",
  },
];

export function ProviderLanding() {
  const { connecting, connect } = useWallet();

  return (
    <div className="animate-fade-in space-y-10">
      <section className="glass glow-blue overflow-hidden rounded-2xl p-6 sm:p-10">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-locka-cyan/25 bg-locka-cyan/10 px-3 py-1 text-xs font-medium text-locka-cyan">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              Running on {networkLabel}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Patient history,{" "}
              <span className="bg-gradient-to-r from-locka-cyan to-brand-blue bg-clip-text text-transparent">
                with consent attached
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/60 sm:text-base">
              The LockA provider portal is how hospitals, clinics, laboratories, pharmacies, and
              insurers ask for the records they need, read only what the patient approved, and issue
              records other providers can verify.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" loading={connecting} onClick={connect}>
                Connect wallet
              </Button>
              <a
                href="#getting-started"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-locka-cyan"
              >
                See how it works
              </a>
            </div>
          </div>
          <LockaWordmark width={200} priority className="shrink-0" />
        </div>
      </section>

      <section>
        <h2 className="section-rule mb-4">
          What the portal gives you
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent"
          />
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((item) => (
            <Card key={item.title}>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="getting-started" className="scroll-mt-20">
        <h2 className="section-rule mb-4">
          Getting started
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent"
          />
        </h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <li key={item.step} className="glass rounded-xl p-5">
              <span className="font-mono text-xs font-semibold text-locka-cyan">{item.step}</span>
              <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground">What you are accountable for</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/60">
          Requests are public to the patient and logged against your account: who asked, what was
          asked for, and why. Ask for the minimum the episode of care needs, and hand access back
          when it ends.
        </p>
      </section>
    </div>
  );
}
