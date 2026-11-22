# Ontario Advisor Practice Simulator

A browser-based, Release 1 learning simulation for fictional Ontario bank investment-advisor conversations. It focuses on TFSA account opening and funding, identity and AML steps, KYC, product fit, client review, a simulated order, and a service follow-up.

## Run locally

Install a current Node.js runtime, then run from this directory:

```powershell
npm start
```

Open `http://127.0.0.1:4173`. The server listens on loopback only. There are no dependencies to install.

## What to explore

- **Money needed soon:** tests a near-term liquidity requirement against a non-redeemable GIC term.
- **Long horizon, cautious investor:** shows how low risk tolerance and limited mutual-fund knowledge affect a balanced-fund discussion.
- **Future account types:** RRSP, RESP, LIRA, FHSA, and non-registered are displayed as disabled options for later releases.

Each journey carries fictional client facts through the account, identity, KYC, product, and review screens. Scenario rules block an unsuitable product selection and offer an alternative. Product rates, product terms, and bank procedures are fictional and labeled in the interface.

## Boundaries and regulatory references

This is an educational simulation, not a bank platform, legal interpretation, or recommendation engine. It does not verify identities, connect to CRA or an account, calculate real TFSA contribution room, store profiles or sessions, open accounts, or execute transactions. A “simulated order” only adds a fictional event to the in-memory timeline.

Public CRA, FINTRAC, and CIRO references are linked in the explainers. They are learning references, not a complete or current legal validation of the simulator. Before extending the simulator to another product, account type, province, or real operational use, review the applicable current statutes, regulations, regulator guidance, dealer rules, issuer requirements, and bank procedures. Public rules and fictional training gates are distinguished in the interface.
