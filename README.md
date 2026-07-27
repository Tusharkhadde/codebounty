# CodeBounty - GitHub Bug Bounty Escrow on Stellar/Soroban

[![Test Suite](https://github.com/yourorg/codebounty/actions/workflows/test.yml/badge.svg)](https://github.com/yourorg/codebounty/actions/workflows/test.yml)
[![Deploy](https://github.com/yourorg/codebounty/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourorg/codebounty/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Automated bug bounty escrow platform powered by Stellar/Soroban smart contracts. Fund bounties for GitHub issues — when a PR is merged, payment releases automatically.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CODEBOUNTY PLATFORM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │   Frontend    │    │  GitHub Webhooks  │    │  Oracle Relay    │   │
│  │  (Next.js)   │◄───►│  (Pull Request   │───►│  (Express/TS)    │   │
│  │              │    │   merged event)   │    │                  │   │
│  └──────┬───────┘    └──────────────────┘    └────────┬─────────┘   │
│         │                                              │             │
│         │ RPC Calls                            Ed25519 Signed         │
│         │ (Soroban SDK)              Attestations (bounty_id + PR +   │
│         │                                              SHA)           │
│         ▼                                              ▼             │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    SOROBAN BLOCKCHAIN                         │    │
│  │                                                               │    │
│  │  ┌────────────────────┐         ┌────────────────────┐       │    │
│  │  │   BountyRegistry   │◄────────┤  MergeVerifier     │       │    │
│  │  │   (Contract 1)     │ INTER   │   (Contract 2)     │       │    │
│  │  │                    │ CONTRACT│                    │       │    │
│  │  │ • create_bounty()  │ CALLS   │ • submit_merge_proof()│      │    │
│  │  │ • fund_bounty()    │────────►│ • verify_signature() │      │    │
│  │  │ • link_pr()        │ RELEASE │ • release_payment()  │      │    │
│  │  │ • cancel_bounty()  │ PAYMENT │   (cross-contract)   │      │    │
│  │  └────────┬───────────┘         └────────────────────┘       │    │
│  │           │                                                    │    │
│  │           │ Token Escrow (XLM/USDC)                           │    │
│  │           ▼                                                    │    │
│  │  ┌────────────────────┐                                       │    │
│  │  │  Stellar Asset     │                                       │    │
│  │  │  Contract (SAC-20) │                                       │    │
│  │  └────────────────────┘                                       │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### How Payments Work

1. **Maintainer** creates a bounty by linking a GitHub issue URL and funding it with tokens (escrowed by BountyRegistry)
2. **Contributor** solves the issue and opens a PR, links it to the bounty
3. **GitHub** sends a webhook when the PR is merged (`pull_request.closed` with `merged: true`)
4. **Oracle Relay** receives the webhook, verifies it references a bounty, signs an attestation
5. **MergeVerifier** contract verifies the relay's signature and calls `BountyRegistry.release_payment()`
6. **Funds** are automatically transferred to the contributor's wallet

## Why the Two-Party Trust Model Works

The security model relies on:

- **Signed attestations**: Each proof is signed with the relay's Ed25519 key, scoped to a specific `bounty_id` + `pr_url` + `merge_commit_sha`. The relay cannot forge signatures.
- **GitHub API cross-check**: The relay verifies against the real GitHub API that a PR was actually merged, preventing fake merge proofs.
- **Replay protection**: Each `(bounty_id, pr_url, merge_commit)` tuple can only be submitted once on-chain.
- **Escrow security**: Funds are held by the BountyRegistry contract — no single party can withdraw without the merge verification.

### Known Limitations

- **Centralized relay**: Currently, a single relay operator signs all attestations. In production, this should be upgraded to a **multi-relay quorum** system where N of M relays must agree on a merge event.
- **Off-chain dependency**: The platform requires the relay to be online to process merged PRs. If the relay is down, payments are delayed but funds remain safe in escrow.
- **Manual bounty-to-issue mapping**: The relay currently parses bounty IDs from PR descriptions. A more robust approach would use GitHub labels or a dedicated issue milestone system.

## Components

### 1. Smart Contracts (`contracts/`)

Three Soroban contracts implementing the core logic:

| Contract | Purpose |
|----------|---------|
| `BountyRegistry` | Manages bounty lifecycle: create, fund, link PR, cancel |
| `MergeVerifier` | Verifies relay signatures and triggers payouts |
| `PayoutModule` | Handles payment release and dispute management |

**Key functions:**
- `BountyRegistry.create_bounty()` — Create a new bounty
- `BountyRegistry.fund_bounty()` — Deposit tokens into escrow
- `BountyRegistry.link_pr()` — Contributor links their PR
- `MergeVerifier.submit_merge_proof()` — Relay submits verified merge attestation
- `PayoutModule.release_payment()` — Releases escrowed funds to contributor

### 2. Oracle Relay (`relay/`)

TypeScript service that:
- Receives GitHub webhook events (`pull_request.closed`)
- Verifies the PR was actually merged via GitHub API
- Extracts bounty ID from PR body (patterns: `BountyID: 42`, `Closes bounty #7`)
- Signs attestation with relay's Ed25519 keypair
- Submits proof to MergeVerifier contract

**Deploy as:**
- Render/Railway free tier (Express server)
- Vercel serverless function
- Any Node.js hosting with webhook support

### 3. Frontend (`frontend/`)

Next.js + TailwindCSS application with:
- **Maintainer view**: Connect wallet → Create & fund bounty → Paste GitHub issue URL
- **Contributor view**: Browse open bounties → Link PR → Track status
- **Live status**: Real-time bounty lifecycle visualization with stepper
- **Mobile responsive**: Tested down to 375px width

## Setup & Local Development

### Prerequisites

- **Rust** 1.75+ with `wasm32-unknown-unknown` target
- **Soroban CLI**: `cargo install --locked soroban-cli`
- **Node.js** 20+
- **Freighter wallet** extension for browser

### Contract Development

```bash
# Navigate to contracts directory
cd contracts

# Build all contracts
cargo build --release --target wasm32-unknown-unknown

# Run contract tests
cargo test

# Build individual contract
cd bounty-registry && cargo build --release --target wasm32-unknown-unknown
cd ../merge-verifier && cargo build --release --target wasm32-unknown-unknown
```

### Relay Development

```bash
cd relay

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your GitHub webhook secret and Soroban RPC URL

# Run in development mode
npm run dev

# Build
npm run build

# Test
npm test
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your contract addresses

# Run development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run start
```

## Deployment Workflow

### 1. Deploy Contracts

```bash
# Deploy BountyRegistry first
soroban deploy \
  --wasm target/wasm32-unknown-unknown/release/bounty_registry.wasm \
  --source $SOROBAN_SOURCE_ACCOUNT \
  --network futurenet

# Get registry address, then deploy MergeVerifier
soroban deploy \
  --wasm target/wasm32-unknown-unknown/release/merge_verifier.wasm \
  --source $SOROBAN_SOURCE_ACCOUNT \
  --network futurenet \
  --arg bounty_registry_addr <REGISTRY_ADDRESS>

# Authorize MergeVerifier to call payout
soroban invoke \
  --contract $REGISTRY_ADDRESS \
  --name set_authorized_caller \
  --arg addr <VERIFIER_ADDRESS> \
  --source $SOROBAN_SOURCE_ACCOUNT \
  --network futurenet
```

### 2. Deploy Relay

```bash
# Set environment variables
export GITHUB_WEBHOOK_SECRET=your-secret
export RELAY_PRIVATE_KEY=your-ed25519-private-key
export SOROBAN_RPC_URL=https://rpc-futurenet.stellar.org
export MERGE_VERIFIER_ADDRESS=<deployed-address>
export BOUNTY_REGISTRY_ADDRESS=<deployed-address>

# Deploy to Render/Railway/Vercel
# See platform-specific documentation
```

### 3. Configure GitHub Webhook

```
Settings → Webhooks → Add webhook
Payload URL: https://your-relay.com/webhook/github
Content type: application/json
Secret: <same as GITHUB_WEBHOOK_SECRET>
Events: Pull Request (closed only)
```

### 4. Deploy Frontend

```bash
# Vercel deployment
vercel --prod

# Or set environment variables in your hosting platform
NEXT_PUBLIC_BOUNTY_REGISTRY_ADDRESS=<address>
NEXT_PUBLIC_MERGE_VERIFIER_ADDRESS=<address>
NEXT_PUBLIC_STELLAR_NETWORK=futurenet

# Required for bounty persistence across redeploys
DATABASE_URL=<shared postgres or neon connection string>
# or
CLOUDBOUNTY_STORAGE_URL=<persistent json endpoint>
```

If neither shared database nor cloud storage is configured, bounty data will only exist in the current server process and will be lost on redeploys.

## Testing

### Contract Tests (10+ tests)

```bash
cd contracts
cargo test --release
```

| Test | Contract | Description |
|------|----------|-------------|
| `test_create_bounty` | BountyRegistry | Creates a new bounty with valid data |
| `test_fund_bounty` | BountyRegistry | Funds a bounty with escrowed tokens |
| `test_link_pr` | BountyRegistry | Links a PR to an existing bounty |
| `test_cancel_unfunded` | BountyRegistry | Cancels bounty before funding |
| `test_cancel_blocked_after_fund` | BountyRegistry | Cannot cancel funded bounty |
| `test_invalid_amount` | BountyRegistry | Rejects zero/negative amounts |
| `test_valid_signature` | MergeVerifier | Accepts properly signed proof |
| `test_invalid_signature` | MergeVerifier | Rejects bad signatures |
| `test_replay_prevention` | MergeVerifier | Same proof cannot be submitted twice |
| `test_full_lifecycle` | Integration | End-to-end: create → fund → link → verify → payout |
| `test_dispute_timeout` | PayoutModule | Funds return to maintainer after dispute timeout |

### Frontend Tests

```bash
cd frontend
npm test
```

| Test | Description |
|------|-------------|
| `bounty-creation-form-validation` | Validates URL format, amount, deadline |
| `wallet-connect-error-state` | Shows error when wallet not available |
| `status-stepper-created` | Renders "Bounty Created" step |
| `status-stepper-funded` | Renders "Funded" step |
| `status-stepper-pr-linked` | Renders "PR Linked" step |
| `status-stepper-paid` | Renders "Paid Out" step |

## Contract Addresses (Futurenet Testnet)

| Contract | Address |
|----------|---------|
| BountyRegistry | `<deployed-address>` |
| MergeVerifier | `<deployed-address>` |
| Relay Service | `https://codebounty-relay.onrender.com` |
| Frontend | `https://codebounty.vercel.app` |

### Sample Transaction

Full bounty lifecycle transaction: `CAbc123...xyz`

_(Replace with actual transaction hash after deploying to Futurenet)_

## Project Structure

```
codebounty/
├── contracts/
│   ├── Cargo.toml              # Workspace config
│   ├── bounty-registry/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs          # Main contract
│   │       └── test.rs         # Contract tests
│   └── merge-verifier/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs          # Main contract
│           └── test.rs         # Contract tests
├── relay/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts            # Express webhook relay
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── BountyCard.tsx
│       │   ├── CreateBountyForm.tsx
│       │   ├── BountyStepper.tsx
│       │   ├── LoadingState.tsx
│       │   └── ErrorState.tsx
│       ├── contexts/
│       │   └── WalletContext.tsx
│       └── types/
│           └── index.ts
├── .github/
│   └── workflows/
│       ├── test.yml            # CI test pipeline
│       └── deploy.yml          # CD deployment pipeline
├── .env.example                # Environment template
└── README.md                   # This file
```

## License

## Production workflow

1. **GitHub identity**: configure `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL`. The app uses GitHub OAuth only; wallet connection is for signing deposits, not identity.
2. **Database**: start PostgreSQL, set `DATABASE_URL`, then run `cd relay && npx prisma migrate dev --name init && npx prisma generate`. Prisma models users, wallets, bounties, and verification evidence.
3. **Escrow funding**: the user must sign a Soroban transaction. An AI agent or relay must never receive a private key or custody funds.
4. **Merge verification**: GitHub sends a signed `pull_request` webhook to the relay. The relay validates the signature, records verification evidence, then submits a signed proof to `MergeVerifier`.
5. **Refunds**: expose a contract `refund_bounty`/`cancel_bounty` action only under the on-chain rules (for example, unfunded, expired, or a configured timeout). The UI must query the contract status before enabling it.
6. **AI review**: `AI_REVIEW_API_KEY` is optional. Use it only to classify or summarize evidence; it is never an authorization signal for releasing or refunding escrow.

### Required deployment secrets

Set the OAuth, database, GitHub webhook, relay signing, Soroban RPC, and deployed contract address variables in the GitHub deployment environment. CI validates lint, tests, frontend build, relay build, and contract WASM; deployment intentionally fails if real contract addresses are absent.

MIT

## Acknowledgments

- Built on [Stellar](https://stellar.org/) using [Soroban](https://soroban.stellar.com)
- Wallet integration via [Freighter](https://freighter.app/)
- Frontend powered by [Next.js](https://nextjs.org/) and [TailwindCSS](https://tailwindcss.com/)
#   c o d e b o u n t y 
 
 