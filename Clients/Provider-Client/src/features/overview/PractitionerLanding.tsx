"use client";

import { LockaWordmark } from "@/components/layout/LockaLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWallet } from "@/features/wallet/WalletContext";
import { networkLabel } from "@/lib/config";

const CAPABILITIES = [
  {
    title: "Ask, don't chase",
    body: "Request one record category for one window. The patient sees your name, your role, your organisation, and your reason, then decides.",
  },
  {
    title: "History you can rely on",
    body: "Read allergies, diagnoses, prescriptions, lab results, and vaccination records the patient already holds, instead of repeating tests.",
  },
  {
    title: "Sign what you issue",
    body: "Every result you write carries the practitioner id the registry minted for you, so a patient can trace it back to you years later.",
  },
  {
    title: "Checkable documents",
    body: "Hash a file you were handed and compare it against the record's commitment before you act on it.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Register yourself",
    body: "Submit your full government name, your practising licence number, and the organisation you work with. The registry mints your practitioner id from them.",
  },
  {
    step: "02",
    title: "Start immediately",
    body: "Registration is approved automatically for now, so you can work as soon as it lands. Administrator review of licence details comes later.",
  },
  {
    step: "03",
    title: "Request patient access",
    body: "Send a request against a passport id. Nothing is readable until the patient approves it.",
  },
  {
    step: "04",
    title: "Read and write within scope",
    body: "Read what the grant covers, issue records while it is open, and hand access back when the episode of care ends.",
  },
];

export function PractitionerLanding() {
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
              Your practice,{" "}
              <span className="bg-gradient-to-r from-locka-cyan to-brand-blue bg-clip-text text-transparent">
                on the record
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/60 sm:text-base">
              The LockA practitioner portal is how a doctor, nurse, midwife, pharmacist, laboratory
              scientist, radiographer, physiotherapist, or dentist asks for the records they need,
              reads only what the patient approved, and issues results that carry their own
              practitioner id.
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
          Requests and records are logged against your practitioner id, not your
          organisation&apos;s: who asked, what was asked for, why, and what was issued. Ask for the
          minimum the episode of care needs, and hand access back when it ends.
        </p>
      </section>
    </div>
  );
}
