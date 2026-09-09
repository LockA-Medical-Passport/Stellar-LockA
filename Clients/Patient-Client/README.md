# LockA Patient Client

The public, patient-facing front end of [LockA Medical Passport](../../README.md): a
patient-controlled health passport built on Stellar with Soroban smart contracts.

Patients use this client to hold their own medical records, decide which provider may read which
record category and for how long, and close that access again whenever they choose.

## What it covers

| Screen                     | What a patient does there                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview `/`               | Public explanation of the passport when no wallet is connected; a summary of passport status, open grants, pending requests, and recent activity once one is. |
| My passport `/passport`    | Passport id, status, identity commitment, and the recovery account, plus what is and is not written to the network.                                           |
| Create `/passport/create`  | Registers a passport, deriving the identity commitment in the browser.                                                                                        |
| Medical records `/records` | Every record a verified provider has added, filtered by category and status, each with a hash check.                                                          |
| Consent `/consent`         | Approve, narrow, reject, and revoke provider access requests.                                                                                                 |
| Activity `/activity`       | The audit trail, each entry linked to its Stellar transaction.                                                                                                |
| Settings `/settings`       | Network, RPC endpoint, contract ids, and the connected account.                                                                                               |

## Running it

```bash
npm install
cp .env.example .env.local   # optional; every value has a working default
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

It runs on sample data out of the box, so no backend, deployed contract, or wallet extension is
needed to see every screen. See [../README.md](../README.md) for the dependency list, the
configuration reference, and the two files that wallet integration plugs into.

## License

MIT, in line with the rest of the LockA platform.
