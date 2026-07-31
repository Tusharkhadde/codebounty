# 🚀 CodeBounty — GitHub Bug Bounty Escrow on Stellar / Soroban

<div align="center">

[![Build & Test](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square&logo=github)](https://github.com/Tusharkhadde/codebounty)
[![Network](https://img.shields.io/badge/Stellar-Testnet-blue?style=flat-square&logo=stellar)](https://stellar.org)
[![Framework](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Smart Contracts](https://img.shields.io/badge/Soroban-Rust%20WASM-orange?style=flat-square&logo=rust)](https://soroban.stellar.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-purple?style=flat-square&logo=vercel)](https://codebounty-nine.vercel.app)

**CodeBounty** is a trustless bug bounty platform powered by **Stellar / Soroban smart contracts**.  
Maintainers fund GitHub issues with XLM / USDC escrow. When a contributor's PR is merged, the Oracle Relay automatically verifies the merge and releases the on-chain payment — no middlemen, no trust required.

[Live Demo](https://codebounty-nine.vercel.app) · [Report Bug](https://github.com/Tusharkhadde/codebounty/issues) · [Request Feature](https://github.com/Tusharkhadde/codebounty/issues)

</div>

---

## 📌 Table of Contents

- [🖼️ Screenshots](#️-screenshots--ui-walkthrough)
- [🏗 Architecture](#-architecture)
- [✨ Key Features](#-key-features)
- [🔄 How It Works](#-how-it-works)
- [🔐 Security & Trust Model](#-security--trust-model)
- [🧩 Project Structure](#-project-structure)
- [🛠 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Smart Contracts](#2-smart-contracts-rust--soroban)
  - [3. Oracle Relay Service](#3-oracle-relay-service-express--typescript)
  - [4. Frontend Application](#4-frontend-application-nextjs-14)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🚢 Deployment](#-deployment)
- [📄 License & Acknowledgments](#-license--acknowledgments)

---

## 🖼️ Screenshots & UI Walkthrough

> A complete, visual walkthrough of the CodeBounty platform from sign-in to payout.

---

### 1. 🏠 Overview — "Open-source work, funded with intent."

The landing page explains the 3-step bounty workflow in a clean, dark interface. New users can connect their Freighter wallet or explore in demo mode from here.

![Overview — Landing page showing the hero, 3-step workflow card, and sidebar navigation](Screenshot%202026-07-31%20090009.png)

---

### 2. 🔐 GitHub Sign-In & Web3 Auth

Before creating a bounty, users authenticate via **GitHub OAuth**. The sign-in page outlines the platform's core value props: linked GitHub PRs, non-custodial wallet signatures, and verifiable payout addresses.

![GitHub OAuth sign-in page with "Continue with GitHub" button](Screenshot%202026-07-31%20090427.png)

---

### 3. ➕ Create a Bounty — Identity Setup

When a user navigates to **Create Bounty**, the platform first verifies both their GitHub identity and Stellar wallet. A live connection status shows which steps are complete before unlocking the bounty creation form.

![Create Bounty page showing GitHub account verified and Stellar wallet connect prompt](Screenshot%202026-07-31%20090102.png)

---

### 4. 🔗 Connecting the Freighter Wallet

Clicking **Connect** opens the **Freighter** browser extension. The wallet shows the site's domain, the connected wallet address, and the active network (Testnet) before the user approves the connection.

![Freighter wallet connection request popup over the Create Bounty page](Screenshot%202026-07-31%20090216.png)

---

### 5. 📋 Bounties List — Browse Active & Paid Bounties

The **Bounties** page lists all on-chain bounties with search, filter by status (`All`, `Paid`), and sorting by deadline. Each card shows the XLM reward, linked GitHub issue, creator wallet address, and due date.

> The screenshot shows a real, completed **250 XLM** bounty linked to `Tusharkhadde/Second_Brain/issues/1` — marked **Paid out**.

![Bounties list showing a 250 XLM paid-out bounty for Tusharkhadde/Second_Brain/issues/1](Screenshot%202026-07-31%20090302.png)

---

### 6. 🔍 Bounty Detail — 5-Stage Progress Stepper

Clicking into a bounty reveals the **full lifecycle tracker**: a 5-stage stepper (Created → Funded → PR Linked → Verified → Paid) with real-time progress and a completion percentage. The screenshot shows **100% COMPLETE** for the 250 XLM bounty.

![Bounty detail page showing 5-step stepper at 100% complete with "Bounty completed! 🎉"](Screenshot%202026-07-31%20094410.png)

---

### 7. 🔗 Linked PR & Escrow Specs

The bounty detail page also shows the **Linked GitHub Issue**, the **Submitted Pull Request** (with merge status), the **Contributor wallet address** that received payment, and the **Escrow Specs** sidebar with deadline and creator address.

![Bounty detail showing linked issue URL, submitted PR marked "Merged", contributor wallet, and escrow specs](Screenshot%202026-07-31%20094317.png)

---

### 8. 👤 Profile — Contributor Stats & Payout Addresses

The **Profile** page shows the connected Stellar address, role badge (Hunter / Developer), member date, and four stat cards: **Total Earned (250 XLM)**, **Bounties Funded**, **Saved Wallets**, and **Trust Rating (100% — Soroban Verified)**. Users can also add multi-chain payout addresses here.

![Profile page for Tusharkhadde showing 250 XLM earned, 1 bounty funded, and 100% trust rating](Screenshot%202026-07-31%20090343.png)

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           CODEBOUNTY PLATFORM                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐    ┌────────────────────┐    ┌───────────────────┐   │
│  │    Frontend    │    │  GitHub Webhooks   │    │   Oracle Relay    │   │
│  │   (Next.js)    │◄───►│ (pull_request      │───►│  (Express/TS)     │   │
│  │                │    │  closed & merged)  │    │                   │   │
│  └───────┬────────┘    └────────────────────┘    └─────────┬─────────┘   │
│          │                                                 │             │
│          │ RPC Calls (Soroban Client)          Ed25519 Signed Proofs     │
│          │                                                 │             │
│          ▼                                                 ▼             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     SOROBAN SMART CONTRACTS                        │  │
│  │                                                                    │  │
│  │  ┌───────────────────────┐         ┌───────────────────────────┐  │  │
│  │  │    BountyRegistry     │◄────────┤       MergeVerifier       │  │  │
│  │  │   (Core Registry)     │ INTER-  │   (Signature Verifier)    │  │  │
│  │  │                       │ CONTRACT│                           │  │  │
│  │  │ • create_bounty()     │  CALLS  │ • submit_merge_proof()    │  │  │
│  │  │ • fund_bounty()       │────────►│ • verify_ed25519_sig()    │  │  │
│  │  │ • link_pr()           │ RELEASE │ • release_payment()       │  │  │
│  │  │ • cancel_bounty()     │  FUNDS  │                           │  │  │
│  │  └───────────┬───────────┘         └───────────────────────────┘  │  │
│  │              │                                                     │  │
│  │              │ Token Escrow (XLM / SAC-20 Tokens)                 │  │
│  │              ▼                                                     │  │
│  │  ┌───────────────────────┐                                        │  │
│  │  │ Stellar Asset Contract │                                        │  │
│  │  └───────────────────────┘                                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔒 **Trustless Escrow** | Funds are locked in Soroban smart contracts. Neither party can tamper with escrowed tokens unilaterally. |
| ⚡ **Automated Payouts** | When a PR is merged, the Oracle Relay verifies the merge commit, signs an Ed25519 proof, and triggers instant on-chain payout. |
| 🐙 **GitHub OAuth** | Integrated GitHub authentication validates issue URLs and user identity before bounty creation. |
| 🛑 **Cancellation & Refunds** | Maintainers can cancel unfunded or expired bounties and safely reclaim escrowed tokens. |
| 📊 **Personal Dashboard** | Track bounties created, bounties solved, total XLM earned, and live status per bounty. |
| 🗄️ **Persistent Database** | Powered by **Prisma 7 ORM** + **Neon PostgreSQL** with automatic failover to serverless cloud storage. |
| 🎨 **Dark Stellar UI** | Built with Next.js 14, Tailwind CSS, Shadcn UI primitives, micro-animations, and fully responsive design (375px+). |
| 🔑 **Non-Custodial** | Only the user's Freighter wallet signs transactions. No server holds private keys or custody of funds. |

---

## 🔄 How It Works

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer
    participant Frontend
    participant Soroban as Soroban Contract
    participant GitHub
    participant Relay as Oracle Relay
    actor Contributor

    Maintainer->>Frontend: Connect Freighter Wallet & GitHub OAuth
    Maintainer->>Frontend: Create & Fund Bounty (Issue URL + XLM Amount)
    Frontend->>Soroban: Invoke create_bounty() & fund_bounty()
    Soroban-->>Frontend: Escrow Locked in Registry Contract

    Contributor->>Frontend: Link Merged / Active PR to Bounty
    Frontend->>Soroban: Invoke link_pr()

    GitHub->>Relay: Webhook: pull_request.closed (merged = true)
    Relay->>GitHub: Verify PR merge commit via GitHub API
    Relay->>Soroban: Submit Ed25519 signed proof to MergeVerifier
    Soroban->>Soroban: Verify signature & execute cross-contract payout
    Soroban-->>Contributor: Transfer Escrowed Tokens to Contributor Wallet
```

### Step-by-Step Summary

1. **Connect** — Maintainer installs Freighter, signs in with GitHub OAuth.
2. **Create** — Maintainer pastes a GitHub issue URL and enters a bounty amount in XLM.
3. **Fund** — Freighter prompts a transaction; funds are locked inside the `BountyRegistry` Soroban contract.
4. **Solve** — Contributor discovers the bounty, opens a pull request that references the issue.
5. **Link PR** — Contributor navigates to the bounty page and submits their PR URL.
6. **Verify** — GitHub fires a `pull_request.closed` webhook to the Oracle Relay once the PR is merged.
7. **Payout** — The Relay verifies the merge via GitHub API, builds a signed Ed25519 proof, and calls `submit_merge_proof()` on-chain.
8. **Done** — The `MergeVerifier` contract validates the signature and releases funds directly to the contributor's Stellar wallet.

---

## 🔐 Security & Trust Model

1. **Ed25519 Cryptographic Proofs** — Merge proofs are signed using the Relay's private key and scoped to a unique `(bounty_id, pr_url, merge_commit_sha)` tuple.
2. **Replay Protection** — Each proof tuple can only be submitted once. Duplicates are rejected by smart contract assertions.
3. **GitHub API Double-Check** — The Oracle Relay verifies every webhook event against GitHub's official REST API to prevent spoofed payloads.
4. **Non-Custodial Design** — No server process, AI agent, or relay node holds private keys or user funds. All escrow authority rests inside Soroban contracts.

---

## 🧩 Project Structure

```text
level_3/
├── contracts/                  # Soroban Smart Contracts (Rust)
│   ├── Cargo.toml              # Cargo workspace definition
│   ├── bounty-registry/        # Core escrow & lifecycle contract
│   │   └── src/lib.rs          #   create_bounty, fund_bounty, link_pr, cancel_bounty
│   └── merge-verifier/         # Signature verification & payout module
│       └── src/lib.rs          #   submit_merge_proof, verify_ed25519_sig, release_payment
├── relay/                      # Oracle Relay (Express + TypeScript)
│   ├── src/index.ts            # GitHub webhook listener & Ed25519 signer
│   └── package.json
├── frontend/                   # Web Application (Next.js 14 + Tailwind + Shadcn)
│   ├── prisma/
│   │   └── schema.prisma       # Prisma 7 schema (Neon PostgreSQL)
│   ├── src/
│   │   ├── app/                # Next.js App Router (Dashboard, Bounties, Profile, About)
│   │   ├── components/         # UI Components, Sidebar, Stepper, Modals
│   │   ├── contexts/           # WalletContext (Freighter Wallet integration)
│   │   ├── lib/                # Prisma client, Neon SQL driver, Global DB fallback
│   │   └── types/              # TypeScript interfaces
│   └── package.json
├── docs/                       # Project documentation & assets
├── .env.example                # Environment variables template
├── deploy.ps1                  # PowerShell deployment script
├── start-relay.ps1             # Relay startup script
├── AGENTS.md                   # Operational & development agent guide
└── README.md                   # This file
```

---

## 🛠 Prerequisites

Ensure the following are installed before you begin:

| Tool | Version | Purpose |
|---|---|---|
| **Rust** | 1.75+ | Compile Soroban contracts |
| **wasm32 target** | — | `rustup target add wasm32-unknown-unknown` |
| **Soroban CLI** | latest | Deploy & interact with contracts |
| **Node.js** | v20.x+ | Run frontend & relay |
| **npm / pnpm** | latest | Package management |
| **Freighter** | browser ext | Stellar wallet (Chrome / Firefox) |
| **PostgreSQL** | 15+ (or Neon) | Database for relay & frontend persistence |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Tusharkhadde/codebounty.git
cd codebounty
```

---

### 2. Smart Contracts (Rust / Soroban)

```bash
# Navigate to contracts directory
cd contracts

# Install wasm32 target if not already added
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli

# Build WASM binaries for all contracts
cargo build --release --target wasm32-unknown-unknown

# Run all unit & integration tests
cargo test

# Deploy BountyRegistry to Stellar Testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/bounty_registry.wasm \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet

# Deploy MergeVerifier to Stellar Testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/merge_verifier.wasm \
  --source <YOUR_STELLAR_SECRET_KEY> \
  --network testnet
```

> **Note:** Save the contract addresses printed after deployment — you'll need them for the `.env` files in the next steps.

---

### 3. Oracle Relay Service (Express / TypeScript)

```bash
# Navigate to relay directory
cd relay

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Fill in `relay/.env`:

```env
PORT=3001
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
RELAY_PRIVATE_KEY=your_ed25519_secret_key
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
BOUNTY_REGISTRY_ADDRESS=<deployed_bounty_registry_address>
MERGE_VERIFIER_ADDRESS=<deployed_merge_verifier_address>
```

```bash
# Run linting & tests
npm run lint
npm test

# Start relay development server
npm run dev
```

> **GitHub Webhook Setup:** In your GitHub repository → **Settings → Webhooks → Add webhook**:
> - **Payload URL**: `https://your-relay-url.com/webhook`
> - **Content type**: `application/json`
> - **Secret**: the `GITHUB_WEBHOOK_SECRET` value
> - **Events**: Select `Pull requests`

---

### 4. Frontend Application (Next.js 14)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Fill in `frontend/.env.local` (see [Environment Configuration](#️-environment-configuration) below).

```bash
# Run database migrations (Prisma)
npx prisma migrate dev

# Run lint checks
npm run lint

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Configuration

### Frontend (`frontend/.env.local`)

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# GitHub OAuth (create at github.com/settings/developers)
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret
AUTH_SECRET=your_nextauth_secret_key_32chars_min

# Soroban Smart Contracts (from deployment step)
NEXT_PUBLIC_BOUNTY_REGISTRY_ADDRESS=CCF6S6CBN5Z6DCAMLRSCEIVISLGGSQ3PSYAHONON2ASGPO3TFS37HB4C
NEXT_PUBLIC_MERGE_VERIFIER_ADDRESS=CANUSGSY7KIXZIPT2GENRAYOHV6HR56IDNPBKW5LBZDOJY7ROC3JCDZ2
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Oracle Relay URL
NEXT_PUBLIC_RELAY_URL=https://your-relay-service.com/

# Database — Neon PostgreSQL (neon.tech) or local PostgreSQL
DATABASE_URL=postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require
```

### Oracle Relay (`relay/.env`)

```env
PORT=3001
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
RELAY_PRIVATE_KEY=your_ed25519_secret_key
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
BOUNTY_REGISTRY_ADDRESS=CCF6S6CBN5Z6DCAMLRSCEIVISLGGSQ3PSYAHONON2ASGPO3TFS37HB4C
MERGE_VERIFIER_ADDRESS=CANUSGSY7KIXZIPT2GENRAYOHV6HR56IDNPBKW5LBZDOJY7ROC3JCDZ2
```

### GitHub OAuth App Setup

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Homepage URL**: `http://localhost:3000`
4. Set **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
5. Copy **Client ID** and generate a **Client Secret** → paste into `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET`

---

## 🧪 Testing & Quality Assurance

### Contract Suite (Soroban Unit & Integration Tests)

```bash
cd contracts

# Run all tests (including create_bounty, fund_bounty, link_pr, cancel_bounty,
# signature verification, and replay-prevention tests)
cargo test --release
```

### Relay Suite

```bash
cd relay
npm run lint
npm test
npm run build
```

### Frontend Suite

```bash
cd frontend

# Lint (ESLint + TypeScript)
npm run lint

# Production build verification (catches type errors & build-time issues)
npm run build

# Unit tests (if configured)
npm test
```

---

## 🚢 Deployment

### Frontend — Vercel (Recommended)

1. Push your fork to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repository.
3. Set the **Root Directory** to `frontend`.
4. Add all `frontend/.env.local` variables in the Vercel **Environment Variables** panel.
5. Deploy. Vercel will auto-detect Next.js and configure the build.

> The live demo is deployed at **[codebounty-nine.vercel.app](https://codebounty-nine.vercel.app)**.

### Oracle Relay — Railway / Render / Fly.io

1. Deploy the `relay/` directory as a Node.js service.
2. Set all relay environment variables in your hosting provider's dashboard.
3. Update `NEXT_PUBLIC_RELAY_URL` in your frontend deployment to point to the relay's public URL.
4. Update your GitHub webhook **Payload URL** to match the deployed relay URL.

### Smart Contracts — Stellar Testnet / Mainnet

The contracts are already deployed on Stellar Testnet. For mainnet deployment:

```bash
# Switch network to mainnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/bounty_registry.wasm \
  --source <YOUR_MAINNET_SECRET_KEY> \
  --network mainnet
```

Update all `*_ADDRESS` environment variables with the new mainnet contract addresses.

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

### Acknowledgments

- **[Stellar Development Foundation](https://stellar.org)** for [Soroban](https://soroban.stellar.com) smart contracts and the Testnet RPC.
- **[Freighter API](https://www.freighter.app/)** for seamless non-custodial browser wallet integration.
- **[Shadcn UI](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)** for clean, composable component primitives.
- **[Neon](https://neon.tech/)** for serverless PostgreSQL hosting.
- **[Prisma](https://www.prisma.io/)** for the type-safe ORM and database migrations.

---

<div align="center">

Made with ❤️ by [Tusharkhadde](https://github.com/Tusharkhadde)

⭐ Star this repo if CodeBounty helped you fund open-source work!

</div>