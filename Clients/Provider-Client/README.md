# LockA Provider Client

The practitioner front end of [LockA Medical Passport](../../README.md): a patient-controlled
health passport built on Stellar with Soroban smart contracts.

A LockA provider is a person, not a building. Doctors, nurses, midwives, pharmacists, laboratory
scientists, radiographers, physiotherapists, and dentists register here in their own name, record
the organisation they practise under, and receive a practitioner id from the provider registry.
That id is stamped on every report and result they issue, so a patient can always trace a record
back to the individual who signed it.

## Registration

A practitioner submits three things that identify them, plus where they work:

| Detail                     | Why it is asked for                                                          |
| -------------------------- | ---------------------------------------------------------------------------- |
| Full government name       | As it appears on the practising licence. Patients see it on every request.   |
| Role                       | What they are licensed to practise as.                                       |
| Practising licence number  | Checkable against the issuing council's register.                            |
| Organisation worked with   | The hospital, clinic, laboratory, or pharmacy they currently practise under. |
| Organisation type, country | Context for the registration and the licence.                                |

The registry mints a practitioner id, shown as `PR-000142`, from those details. Registration is
**auto-approved for now**, so a practitioner can work as soon as it lands; administrator review of
licence details is the step this makes room for, and a suspended or revoked registration is what
blocks access requests and record writing.

Only a hash of the licence number reaches the ledger. The name, the licence number itself, and the
organisation name stay off-chain with locka-api, under the platform's rule that no personally
identifiable information is written to a public chain. The chain holds the practitioner id, the
licence commitment, and the status.

## What it covers

| Screen                       | What a practitioner does there                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview `/`                 | What the portal is for when no wallet is connected; practitioner id, registry status, open grants, outstanding requests, and records issued once one is. |
| Patients `/patients`         | Passports with an open grant, and what each grant's scope covers.                                                                                        |
| Patient `/patients/[id]`     | The records readable under one grant, and its window.                                                                                                    |
| Access requests `/access`    | Every request sent, grouped by whether the patient has answered.                                                                                         |
| Request access `/access/new` | Ask for one record category, for one window, with a reason the patient reads.                                                                            |
| Issued records `/records`    | Records issued under this practitioner id, with amend and revoke.                                                                                        |
| Add record `/records/new`    | Anchor a record against a passport with a live grant, stamped with the practitioner id.                                                                  |
| Verify `/verify`             | Check a document against the commitment held for its record.                                                                                             |
| My registration `/profile`   | The practitioner id, the registry entry, and what patients are promised.                                                                                 |
| Register `/profile/register` | Register as a practitioner and mint the id.                                                                                                              |
| Settings `/settings`         | Network, RPC endpoint, contract ids, and the connected account.                                                                                          |

## Running it

```bash
npm install
cp .env.example .env.local   # optional; every value has a working default
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The port is set in the `dev` and `start`
scripts so this client and the patient client can run side by side.

It runs on sample data out of the box, so no backend, deployed contract, or wallet extension is
needed to see every screen. See [../README.md](../README.md) for the dependency list, the
configuration reference, and the two files that wallet integration plugs into.

## License

MIT, in line with the rest of the LockA platform.
