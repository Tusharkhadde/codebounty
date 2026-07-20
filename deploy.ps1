# CodeBounty deploy script (TESTNET)
# Run from the repo root. Uses the Stellar CLI binary at the repo root (stellar.exe).
#
# Prereqs:
#   - Your Freighter testnet account funded with XLM.
#   - SOROBAN_SOURCE_SECRET set in .env (your Freighter S... secret).
#   - stellar.exe present at repo root (CLI v25+).
#
# Usage (PowerShell):  .\deploy.ps1

$ErrorActionPreference = "Stop"

$CLI = Join-Path $PSScriptRoot "stellar.exe"

# --- Read network + account config from .env ---
$envFile = Join-Path $PSScriptRoot ".env"
$envLines = Get-Content $envFile
function Get-EnvValue($key) {
  ($envLines | Where-Object { $_ -match "^\s*$key\s*=" } | Select-Object -First 1) -replace "^\s*$key\s*=\s*", "" -replace '"', ''
}
$SOURCE = Get-EnvValue "SOROBAN_SOURCE_ACCOUNT"
$SECRET = Get-EnvValue "SOROBAN_SOURCE_SECRET"
$RPC    = Get-EnvValue "SOROBAN_RPC_URL"
$PASS   = Get-EnvValue "SOROBAN_NETWORK_PASSPHRASE"

$WASM_REGISTRY = "contracts\target\wasm32v1-none\release\codebounty_bounty_registry.wasm"
$WASM_VERIFIER  = "contracts\target\wasm32v1-none\release\codebounty_merge_verifier.wasm"
$RELAY_PUB_KEY  = "6d38e11651a7bb423eeb49b53f1bf76d4a74155dbddaf5e45a7fc15388e7dee5"

if (-not $SECRET -or $SECRET -eq "PASTE_YOUR_FREIGHTER_S_SECRET") {
  Write-Host "ERROR: Set SOROBAN_SOURCE_SECRET in .env to your Freighter S... secret first." -ForegroundColor Red
  exit 1
}

Write-Host "Using source account: $SOURCE" -ForegroundColor Cyan

Write-Host "Building contracts (wasm32v1-none via stellar contract build)..." -ForegroundColor Cyan
Push-Location contracts
& $CLI contract build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "Deploying BountyRegistry..." -ForegroundColor Cyan
$REGISTRY = & $CLI contract deploy --wasm $WASM_REGISTRY --source-account $SECRET --rpc-url $RPC --network-passphrase $PASS 2>&1 | ForEach-Object { if ($_ -match '^[CC][A-Z0-9]{55,}$') { $_ } }
$REGISTRY = ($REGISTRY | Select-Object -Last 1).Trim()
Write-Host "BOUNTY_REGISTRY_ADDRESS=$REGISTRY" -ForegroundColor Green

Write-Host "Deploying MergeVerifier..." -ForegroundColor Cyan
$VERIFIER = & $CLI contract deploy --wasm $WASM_VERIFIER --source-account $SECRET --rpc-url $RPC --network-passphrase $PASS 2>&1 | ForEach-Object { if ($_ -match '^[CC][A-Z0-9]{55,}$') { $_ } }
$VERIFIER = ($VERIFIER | Select-Object -Last 1).Trim()
Write-Host "MERGE_VERIFIER_ADDRESS=$VERIFIER" -ForegroundColor Green

Write-Host "Initializing MergeVerifier..." -ForegroundColor Cyan
& $CLI contract invoke --id $VERIFIER --source-account $SECRET --rpc-url $RPC --network-passphrase $PASS -- initialize --admin $SOURCE --registry_addr $REGISTRY --relay_pub_key $RELAY_PUB_KEY
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Authorizing MergeVerifier in BountyRegistry..." -ForegroundColor Cyan
& $CLI contract invoke --id $REGISTRY --source-account $SECRET --rpc-url $RPC --network-passphrase $PASS -- set_authorized_caller --caller $VERIFIER
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Done. Paste these into your .env files:" -ForegroundColor Cyan
Write-Host "BOUNTY_REGISTRY_ADDRESS=$REGISTRY"
Write-Host "MERGE_VERIFIER_ADDRESS=$VERIFIER"
