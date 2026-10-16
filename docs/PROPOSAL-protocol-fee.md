# PROPOSAL (not implemented): protocol fee + reduced trust in payouts

> **Status: proposal only.** Nothing in `contracts/` was changed. The deployed
> testnet contracts behave exactly as before. Any change below needs a new
> contract version, tests, a fresh deployment and ideally a security review
> before mainnet.

## 1. 3% protocol fee on release (funder pays, contributor keeps 100%)

Why: CodeBounty has no revenue path today. Comparable platforms charge
Opire 4% + Stripe fees, IssueHunt 10%, Algora ~9% for organizations
(see the portfolio review for sources). On-chain settlement makes 3% viable.

Sketch for `BountyRegistry` (Soroban, Rust):

- New instance storage: `treasury: Address`, `fee_bps: u32` (300 = 3%), set
  once at `initialize` and changeable only by the admin, with a hard cap
  (e.g. `fee_bps <= 500`).
- Funder deposits `amount + fee` in `fund_bounty` (so the contributor still
  receives the advertised `amount`). Store `fee` on the `Bounty` struct.
- In `release_payment`: transfer `amount` to the contributor and `fee` to
  `treasury`. In `cancel`/refund: return `amount + fee` to the creator
  (no fee on refunds).
- Emit a `fee_paid` event with `(bounty_id, fee)` for transparency.
- Tests: fee math with 7-decimal Stellar amounts, refund returns full deposit,
  cap enforced, non-admin cannot change `fee_bps`.

Optional: an org subscription (e.g. $19/mo via Dodo Payments) that sets a
per-creator fee waiver, checked off-chain before building the fund tx.

## 2. Reduce the single-relay trust assumption

Today one relay key (registered via `set_authorized_caller` on the
MergeVerifier path) can approve any payout. Options, in order of effort:

1. **Dispute window:** `release_payment` marks the bounty `Releasable` with a
   `release_after` ledger; the creator can `dispute` before then; anyone can
   `finalize` after it. Cheap and removes "instant irreversible" risk.
2. **Maintainer co-sign:** optional flag on the bounty requiring the creator's
   signature in addition to the relay proof.
3. **Threshold verifiers:** require M-of-N Ed25519 signatures from
   independent relays over `(bounty_id, pr_url, merge_commit_sha)`.

## 3. Bug to check before mainnet (found while reading, not changed)

In `release_payment`, the native-XLM branch (`token == None`) calls
`clear_escrow` but does not transfer XLM to the contributor, unlike the
token branch which calls `TokenClient::transfer`. Native XLM on Soroban is
also a token contract (the XLM Stellar Asset Contract), so the safer design
is to always store a token address (XLM SAC or USDC SAC) and use
`TokenClient::transfer` for both. Please verify against the testnet payout
history before relying on the native path.
