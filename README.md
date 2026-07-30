# 🚀 CodeBounty — GitHub Bug Bounty Escrow on Stellar/Soroban

[![Build & Test](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square&logo=github)](https://github.com/Tusharkhadde/codebounty)
[![Network](https://img.shields.io/badge/Stellar-Futurenet%2FTestnet-blue?style=flat-square&logo=stellar)](https://stellar.org)
[![Framework](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Smart Contracts](https://img.shields.io/badge/Soroban-Rust%20WASM-orange?style=flat-square&logo=rust)](https://soroban.stellar.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **CodeBounty** is an automated, trustless bug bounty platform powered by **Stellar / Soroban smart contracts**. Maintainers fund GitHub issues with token escrows (XLM / USDC), and when a contributor's pull request is merged, payments are verified by an off-chain Oracle Relay and automatically released on-chain.

---

## 📌 Table of Contents

- [Screenshots & UI Showcase](#-screenshots--ui-showcase)
- [Architecture](#-architecture)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Security & Trust Model](#-security--trust-model)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Smart Contracts](#1-smart-contracts-rust--soroban)
  - [2. Oracle Relay Service](#2-oracle-relay-service-express--typescript)
  - [3. Frontend Application](#3-frontend-application-nextjs-14)
- [Environment Configuration](#-environment-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🖼️ Screenshots & UI Showcase

<div align="center">

### 📊 1. Explore Active Bounties & Dashboard
Browse trustless bounties funded on Stellar with real-time status filtering and search.

![Dashboard Preview](docs/screenshots/dashboard.png)

---

### ➕ 2. Create & Fund Soroban Bounty Escrow
Verify GitHub issues, set XLM bounty amounts, and lock funds securely in smart contract escrows.

![Create Bounty Form](docs/screenshots/create-bounty.png)

---

### 🔍 3. Bounty Lifecycle & Real-Time Stepper
Track linked pull requests, verify merge attestations, and monitor automated payouts.

![Bounty Details & Stepper](docs/screenshots/bounty-details.png)

---

### 👤 4. Personal Contributor & Maintainer Profile
View total XLM earned, bounties created, issues solved, and connected Freighter wallet.

![Personal Profile & Stats](docs/screenshots/profile.png)

</div>

> 💡 *Note: To add or update UI screenshots, place your PNG/JPG image files inside the `docs/screenshots/` directory using the filenames referenced above.*

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
│          │ RPC Calls                               Ed25519 Signed        │
│          │ (Soroban Client)                Attestation Proofs        │
│          │                                                 │             │
│          ▼                                                 ▼             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     SOROBAN SMART CONTRACTS                        │  │
│  │                                                                    │  │
│  │  ┌───────────────────────┐         ┌───────────────────────────┐  │  │
│  │  │    BountyRegistry     │◄────────┤       MergeVerifier       │  │  │
│  │  │   (Core Registry)     │ INTER-  │   (Signature Verifier)    │  │  │
│  │  │                       │ CONTRACT│                           │  │  │
│  │  │ • create_bounty()     │ CALLS   │ • submit_merge_proof()    │  │  │
│  │  │ • fund_bounty()       │────────►│ • verify_ed25519_sig()    │  │  │
│  │  │ • link_pr()           │ RELEASE │ • release_payment()       │  │  │
│  │  │ • cancel_bounty()     │ FUNDS   │                           │  │  │
│  │  └───────────┬───────────┘         └───────────────────────────┘  │  │
│  │              │                                                    │  │
│  │              │ Token Escrow (XLM / SAC-20 Tokens)                 │  │  │
│  │              ▼                                                    │  │
│  │  ┌───────────────────────┐                                        │  │
│  │  │ Stellar Asset Contract │                                        │  │
│  │  └───────────────────────┘                                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- 🔒 **Trustless On-Chain Escrow**: Funds are locked in Soroban smart contracts upon bounty creation. Neither maintainer nor contributor can tamper with escrowed tokens unilaterally.
- ⚡ **Automated Payouts via Oracle Relay**: Once a GitHub PR is merged, the Oracle Relay verifies the merge commit via GitHub's API, signs an Ed25519 proof, and triggers instant on-chain payout.
- 🐙 **GitHub OAuth & Repository Verification**: Integrated GitHub authentication validates issue URLs and user identities before bounty creation.
- 🛑 **Maintainer Refund & Cancellation Authority**: Creators can cancel unfunded or expired bounties to safely refund locked escrow back to their wallet.
- 📊 **Personal Dashboard**: Track bounties created, bounties solved, total XLM earned, and live status (Funded, PR Linked, Paid, Cancelled).
- 🗄️ **Global Persistence & Database Support**: Powered by **Prisma 7 ORM** + **Neon PostgreSQL**, with automatic failover to serverless cloud storage for seamless multi-device sync.
- 🎨 **Modern Dark Stellar UI**: Built with Next.js 14, Tailwind CSS, Shadcn UI primitives, custom micro-animations, and responsive layout across desktop and mobile screens.

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

---

## 🔐 Security & Trust Model

1. **Ed25519 Cryptographic Proofs**: Merge proofs are cryptographically signed using the Relay's private key and scoped to specific `(bounty_id, pr_url, merge_commit_sha)` tuples.
2. **Replay Protection**: Each proof tuple can only be submitted once on-chain. Duplicate submissions are rejected by smart contract assertions.
3. **GitHub API Verification**: The Oracle Relay double-checks every event against GitHub's official API to prevent spoofed webhook payloads.
4. **Non-Custodial Design**: Neither AI subagents, server processes, nor intermediate nodes hold private keys or custody user funds. Escrow authority rests strictly within Soroban contracts.

---

## 🧩 Project Structure

```text
level_3/
├── docs/                       # Project documentation & assets
│   └── screenshots/            # UI Preview screenshots
├── contracts/                  # Soroban Smart Contracts (Rust)
│   ├── Cargo.toml              # Cargo workspace definition
│   ├── bounty-registry/        # Core escrow & lifecycle contract
│   │   └── src/lib.rs
│   └── merge-verifier/         # Signature verification & payout module
│       └── src/lib.rs
├── relay/                      # Webhook Oracle Relay (Express + TypeScript)
│   ├── src/index.ts            # Webhook listener & Ed25519 signer
│   └── package.json
├── frontend/                   # Web Application (Next.js 14 + Tailwind + Shadcn)
│   ├── prisma/                 # Prisma 7 Schema (Neon PostgreSQL)
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app/                # Next.js App Router (Dashboard, Bounties, Profile)
│   │   ├── components/         # UI Components, Sidebar, Stepper, Modals
│   │   ├── contexts/           # WalletContext (Freighter Wallet)
│   │   ├── lib/                # Prisma, Neon SQL driver, Global DB Fallback
│   │   └── types/              # TypeScript interfaces
│   └── package.json
├── AGENTS.md                   # Operational & development guide
└── README.md                   # Project documentation
```

---

## 🛠 Prerequisites

Ensure you have the following installed on your machine:

- **Rust** 1.75+ with target: `rustup target add wasm32-unknown-unknown`
- **Soroban CLI**: `cargo install --locked soroban-cli`
- **Node.js**: v20.x or higher
- **npm** or **yarn** / **pnpm**
- **Freighter Wallet Extension** (browser extension for Stellar)

---

## 🚀 Getting Started

### 1. Smart Contracts (Rust / Soroban)

```bash
# Navigate to contracts directory
cd contracts

# Build WASM binaries for all contracts
cargo build --release --target wasm32-unknown-unknown

# Run contract unit & integration tests
cargo test
```

### 2. Oracle Relay Service (Express / TypeScript)

```bash
# Navigate to relay directory
cd relay

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run development server
npm run dev
```

### 3. Frontend Application (Next.js 14)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Setup local environment variables
cp .env.example .env.local

# Run lint checks
npm run lint

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the platform.

---

## ⚙️ Environment Configuration

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret
AUTH_SECRET=your_nextauth_secret_key

NEXT_PUBLIC_BOUNTY_REGISTRY_ADDRESS=CCF6S6CBN5Z6DCAMLRSCEIVISLGGSQ3PSYAHONON2ASGPO3TFS37HB4C
NEXT_PUBLIC_MERGE_VERIFIER_ADDRESS=CANUSGSY7KIXZIPT2GENRAYOHV6HR56IDNPBKW5LBZDOJY7ROC3JCDZ2
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_RELAY_URL=https://your-relay-service.com/

# Database (Neon PostgreSQL)
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

---

## 🧪 Testing & Quality Assurance

### Contract Suite (Soroban Unit & Integration Tests)
```bash
cd contracts && cargo test --release
```
*Tests cover: `create_bounty`, `fund_bounty`, `link_pr`, `cancel_bounty`, signature verification, and replay prevention.*

### Frontend Suite (Linting & Production Build Verification)
```bash
cd frontend && npm run lint && npm run build
```

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See `LICENSE` for details.

### Acknowledgments
- **Stellar Development Foundation** for [Soroban](https://soroban.stellar.com) smart contracts.
- **Freighter API** for seamless browser wallet connection.
- **Shadcn UI & Tailwind CSS** for clean component primitives.