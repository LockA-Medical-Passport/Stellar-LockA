"use client";

import { LockaWordmark } from "@/components/layout/LockaLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { networkLabel } from "@/lib/config";
import { useWallet } from "@/features/wallet/WalletContext";

const CAPABILITIES = [
  {
    title: "Records that travel with you",
    body: "Diagnoses, prescriptions, lab results, allergies, and vaccination records stay in one passport, whichever clinic, hospital, laboratory, or pharmacy you visit next.",
  },
  {
    title: "You decide who reads what",
    body: "Providers ask for a specific record category and a specific window. Nothing opens until you approve it, and you can close it again at any time.",
  },
  {
    title: "Encrypted off the chain",
    body: "The network holds permissions, commitments, and an audit trail. Your documents stay encrypted in the health vault, never on a public ledger.",
  },
  {
    title: "Provable, not just stored",
    body: "Every record carries a commitment anchored on Stellar, so a provider can check that the file they were handed is the file that was issued.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your passport",
    body: "Connect a Stellar account and register an identity commitment. It proves the passport is yours without publishing anything about you.",
  },
  {
    step: "02",
    title: "Collect verified records",
    body: "Verified providers add records to your passport. Each one is encrypted, stored off-chain, and anchored by its hash.",
  },
  {
    step: "03",
    title: "Grant access, on your terms",
    body: "Approve a request for one category and one window: thirty minutes, a single visit, or a course of treatment.",
  },
  {
    step: "04",
    title: "Revoke and review",
    body: "Close any grant immediately, and read the full history of who asked, who was let in, and what changed.",
  },
];

export function PublicLanding() {
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
              Your medical history,{" "}
              <span className="bg-gradient-to-r from-locka-cyan to-brand-blue bg-clip-text text-transparent">
                under your control
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/60 sm:text-base">
              LockA is a patient-held health passport. It keeps your records secure, portable, and
              verifiable, and it puts every decision about who can read them in your hands.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" loading={connecting} onClick={connect}>
                Connect wallet
              </Button>
              <a
                href="#how-it-works"
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
          What your passport does
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

      <section id="how-it-works" className="scroll-mt-20">
        <h2 className="section-rule mb-4">
          How it works
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
        <h2 className="text-sm font-semibold text-foreground">
          What LockA never writes to the network
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/60">
          No diagnosis, prescription, lab result, identity document, or other personally
          identifiable medical information is stored on-chain. The ledger holds only what has to be
          public to be trustworthy: permissions, hashes, revocation state, and events.
        </p>
      </section>
    </div>
  );
}
