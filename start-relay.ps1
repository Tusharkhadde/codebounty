# Start the CodeBounty relay service (TESTNET)
# Prereqs (already configured in relay/.env):
#   - DATABASE_URL (Neon) set
#   - GITHUB_WEBHOOK_SECRET set
#   - RELAY_PRIVATE_KEY set
#   - SOROBAN_RPC_URL = testnet
#   - BOUNTY_REGISTRY_ADDRESS / MERGE_VERIFIER_ADDRESS set (after deploy.ps1)
#
# Usage:  .\start-relay.ps1

$ErrorActionPreference = "Stop"
$relayDir = Join-Path $PSScriptRoot "relay"

Write-Host "Installing relay dependencies (if needed)..." -ForegroundColor Cyan
Push-Location $relayDir
if (-not (Test-Path node_modules)) { npm install }

# Prisma client generation is optional: the relay does not import @prisma/client
# at runtime. Prisma 7 moved the datasource `url` out of the schema, so `prisma generate`
# requires additional config. Skipped here so the relay can run without a DB wired up.
# To enable the database later, add a prisma.config.ts and run: npx prisma generate
Write-Host "Skipping prisma generate (optional / not used by relay at runtime)..." -ForegroundColor Yellow

Write-Host "Building relay TypeScript..." -ForegroundColor Cyan
npm run build

Write-Host "Starting relay (npm run dev)..." -ForegroundColor Cyan
npm run dev
Pop-Location
