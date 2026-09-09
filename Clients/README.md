![LockA](../Assets/lockA_blue.png)

# LockA Clients

The two front ends of [LockA Medical Passport](../README.md), the patient-controlled health
passport built on Stellar with Soroban smart contracts.

| Client                                 | Audience                                                    | Dev URL                                        |
| -------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| [Patient-Client](Patient-Client/)      | The public. Patients holding their own medical passport.     | [localhost:3000](http://localhost:3000)        |
| [Provider-Client](Provider-Client/)    | Hospitals, clinics, laboratories, pharmacies, and insurers. | [localhost:3001](http://localhost:3001)        |

The third front end, the administrator interface that verifies provider registrations, lives in
[Admin-Client](../Admin-Client/) at the repository root.

## What each client does

**Patient-Client** is the public face of LockA. Without a wallet it explains what the passport is
and how consent works. With a wallet connected it covers the patient side of the platform end to
end:

- Create a passport, deriving an identity commitment in the browser so the underlying phrase never
  leaves the device
- Set and replace the recovery account that can rotate the passport key
- Read every record a verified provider has added, filtered by category and status
- Check a document against the commitment held for its record, by pasting a hash or hashing a file
  locally
- Approve, narrow, reject, and revoke provider access requests, one record category and one time
  window at a time
- Read the full audit trail of who asked, who was let in, and what changed, each entry linked to
  its Stellar transaction

**Provider-Client** is the organisation-facing dashboard:

- Register a hospital, clinic, laboratory, pharmacy, insurer, or public health agency, submitting
  only a hash of the licence number
- See verification status, with access and record writing locked until an administrator verifies
  the organisation
- Request patient access by passport id, stating the record category, the window, and the reason
  the patient will read
- Work through patients with an open grant, seeing only the records that grant's scope covers
- Issue records against a passport, anchoring the hash of the encrypted document and of its
  storage pointer
- Mark a record amended or revoked
- Verify that a document handed over by someone else is the document that was issued

## Requirements

| Requirement | Version                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| Node.js     | 20.9 or newer. Next.js 16 dropped Node 18.                              |
| npm         | 10 or newer, or the equivalent pnpm, yarn, or bun.                      |
| Browser     | Chrome 111+, Edge 111+, Firefox 111+, or Safari 16.4+ for development.  |

## Dependencies

Both clients run on the same stack as the Admin-Client, so a change learned in one applies to all
three.

### Runtime

| Package          | Version  | Why it is here                                                                     |
| ---------------- | -------- | ---------------------------------------------------------------------------------- |
| `next`           | 16.2.12  | App Router, Turbopack, file-based routing, font and image optimisation.            |
| `react`          | 19.2.4   | UI runtime.                                                                        |
| `react-dom`      | 19.2.4   | DOM renderer, plus `createPortal` for the modal and toast layers.                  |
| `clsx`           | ^2.1.1   | Conditional class names.                                                           |
| `tailwind-merge` | ^3.6.0   | Resolves conflicting Tailwind classes so component props can override base styles. |

### Development

| Package                  | Version | Why it is here                                            |
| ------------------------ | ------- | --------------------------------------------------------- |
| `typescript`             | ^5      | Type checking. Next.js 16 requires 5.1 or newer.          |
| `tailwindcss`            | ^4      | The design system's utility layer.                        |
| `@tailwindcss/postcss`   | ^4      | Tailwind v4 PostCSS plugin, wired up in `postcss.config.mjs`. |
| `eslint`                 | ^9      | Linting, via flat config.                                 |
| `eslint-config-next`     | 16.2.12 | Next.js core-web-vitals and TypeScript rule sets.         |
| `eslint-config-prettier` | ^10.1.8 | Turns off rules Prettier already handles.                 |
| `prettier`               | ^3.9.6  | Formatting.                                               |
| `@types/node`            | ^20     | Node type definitions.                                    |
| `@types/react`           | ^19     | React type definitions.                                   |
| `@types/react-dom`       | ^19     | React DOM type definitions.                               |

No wallet or Stellar SDK dependency is installed yet. Wallet integration is the next task, and the
two seams it plugs into are described under [Wallet integration](#wallet-integration-next-step).

## Initialise and run

Each client is a self-contained Next.js application, installed and run on its own.

### Patient-Client

```bash
cd Clients/Patient-Client
npm install
cp .env.example .env.local    # optional; every value has a working default
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Provider-Client

```bash
cd Clients/Provider-Client
npm install
cp .env.example .env.local    # optional; every value has a working default
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The port is set in the `dev` and `start`
scripts so both clients can run side by side.

### Everything else

| Command                | What it does                                             |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Development server with hot reloading, on Turbopack.     |
| `npm run build`        | Production build. Also runs a full TypeScript check.     |
| `npm start`            | Serves the production build. Run `npm run build` first.  |
| `npm run lint`         | ESLint over the whole project.                           |
| `npm run format`       | Rewrites files with Prettier.                            |
| `npm run format:check` | Fails if anything is unformatted. Useful in CI.          |
| `npx tsc --noEmit`     | Type check on its own, without building.                 |

## Sample data mode

Both clients ship with `NEXT_PUBLIC_DEMO_MODE=true` as the default, so `npm run dev` gives a fully
navigable app with no backend, no deployed contracts, and no wallet extension. Reads and writes go
to an in-memory sample ledger in `src/lib/demo/`, which resets on reload. Connecting the wallet
hands the UI a fixed testnet address, and an amber banner across every page states that nothing on
screen is a real medical record.

The sample ledger is one patient passport, five verified providers, a spread of records across
categories, and access requests in every state, which is what makes the empty states, the pending
consent flow, and the expiry handling reviewable before any chain work lands.

Set `NEXT_PUBLIC_DEMO_MODE=false` once the live client is implemented. Until then that setting
makes every read and write throw with a message pointing at the file to fill in.

## Configuration

Both clients read the same `NEXT_PUBLIC_*` variables, documented in each `.env.example`. Every one
has a Stellar testnet default, so `.env.local` is only needed to point a client somewhere else.

| Variable                                            | Default                              |
| --------------------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_DEMO_MODE`                             | `true`                               |
| `NEXT_PUBLIC_LOCKA_API_URL`                         | empty                                |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`            | `Test SDF Network ; September 2015`  |
| `NEXT_PUBLIC_SOROBAN_RPC_URL`                       | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_PATIENT_PASSPORT_REGISTRY_CONTRACT_ID` | empty                                |
| `NEXT_PUBLIC_PROVIDER_REGISTRY_CONTRACT_ID`         | empty                                |
| `NEXT_PUBLIC_MEDICAL_RECORD_REGISTRY_CONTRACT_ID`   | empty                                |
| `NEXT_PUBLIC_CONSENT_ACCESS_MANAGER_CONTRACT_ID`    | empty                                |

The Settings screen in each client shows the network, the RPC endpoint, and which contract ids are
configured, which is the quickest way to confirm an environment is pointing where you think.

## How the code is organised

Both clients follow the Admin-Client's feature-based layout on top of the App Router.

```
src/
  app/          Routes: pages and layouts
  components/
    layout/     App shell, sidebar, navbar, logo lockups
    ui/         Design-system components shared across features
  features/     Feature-scoped modules, each owning its components and state
  lib/          Cross-cutting code: config, domain types, Stellar helpers,
                formatting, the client interface, and the sample ledger
```

Conventions worth knowing before adding code:

- `@/*` maps to `src/*`. Import from `@/components/...`, `@/features/...`, `@/lib/...` rather than
  relative paths that cross directories.
- Code used by one feature lives in that feature's folder. It graduates into `components/`,
  `hooks/`, or `lib/` once a second feature needs it.
- `src/lib/domain.ts` mirrors the Soroban contract types in [Smart-Contracts](../Smart-Contracts/)
  and uses the contracts' own variant names, so values pass straight through once bindings are
  generated.
- Data loading is triggered by wallet events, not by render effects. A connected account is what
  makes passport or provider data fetchable, so the load starts in `WalletProvider` and lands in a
  module store (`passport-store.ts`, `provider-store.ts`) that screens read through
  `useSyncExternalStore`.
- The design system matches the Admin-Client token for token: navy surfaces, glass cards, and the
  cyan and blue accents from [the reference build](https://locka.remixdapp.eth.limo/).
- The LockA logo in [Assets](../Assets/) supplies the platform mark. Each client carries the locker
  mark as its favicon and app icon, and the full lockup on its landing page.

## Wallet integration, the next step

Neither client signs a transaction yet. Two files per client are all that stand between this UI and
a live network:

1. `src/features/wallet/adapter.ts` — implement `freighterAdapter` against
   `@stellar/freighter-api`. Nothing else in either app talks to a wallet.
2. `src/lib/locka-client.ts` — implement `sorobanPatientClient` and `sorobanProviderClient` against
   `@stellar/stellar-sdk` and the generated contract bindings. Every method carries a comment
   naming the contract function it maps to.

Then set `NEXT_PUBLIC_DEMO_MODE=false` and fill in the contract ids. No screen, component, or
feature module needs to change: they only know about the interfaces in those two files.

## License

MIT, in line with the rest of the LockA platform.
