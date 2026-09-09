# LockA Provider Client

The health-provider front end of [LockA Medical Passport](../../README.md): a patient-controlled
health passport built on Stellar with Soroban smart contracts.

Hospitals, clinics, laboratories, pharmacies, insurers, and public health agencies use this client
to request patient-approved access to records, issue records other providers can verify, and check
that a document handed to them is the document that was issued.

## What it covers

| Screen                       | What a provider does there                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview `/`                 | What the portal is for when no wallet is connected; verification status, open grants, outstanding requests, and records issued once one is. |
| Patients `/patients`         | Passports with an open grant, and what each grant's scope covers.                                                                           |
| Patient `/patients/[id]`     | The records readable under one grant, and its window.                                                                                       |
| Access requests `/access`    | Every request sent, grouped by whether the patient has answered.                                                                            |
| Request access `/access/new` | Ask for one record category, for one window, with a reason the patient reads.                                                               |
| Issued records `/records`    | Records this organisation wrote, with amend and revoke.                                                                                     |
| Add record `/records/new`    | Anchor a record against a passport you hold a live grant for.                                                                               |
| Verify `/verify`             | Check a document against the commitment held for its record.                                                                                |
| Organisation `/profile`      | The registry entry and its verification status.                                                                                             |
| Register `/profile/register` | Register the organisation, submitting only a hash of the licence number.                                                                    |
| Settings `/settings`         | Network, RPC endpoint, contract ids, and the connected account.                                                                             |

Requesting access and writing records stay locked until an administrator verifies the organisation
in the `ProviderRegistry` contract, which happens in the [Admin-Client](../../Admin-Client/).

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
