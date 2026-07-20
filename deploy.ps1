# CodeBounty deploy script (TESTNET)
# Run from the repo root after installing the Stellar CLI:
#   cargo install --locked soroban-cli   (WSL recommended)  OR
#   download stellar-cli win32 binary and put stellar.exe on PATH
#
# Prereqs:
#   - Your Freighter testnet account funded with XLM (you have 10000 XLM).
#   - SOROBAN_SOURCE_SECRET set in .env (your Freighter S... secret).
#     The public address is read from SOROBAN_SOURCE_ACCOUNT in .env.
#
# Usage (PowerShell):  .\deploy.ps1

$ErrorActionPreference = "Stop"

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

$KEY_NAME = "codebounty-deployer"
$WASM_REGISTRY = "contracts\target\wasm32-unknown-unknown\release\codebounty_bounty_registry.wasm"
$WASM_VERIFIER  = "contracts\target\wasm32-unknown-unknown\release\codebounty_merge_verifier.wasm"
$RELAY_PUB_KEY  = "6d38e11651a7bb423eeb49b53f1bf76d4a74155dbddaf5e45a7fc15388e7dee5"

if (-not $SECRET -or $SECRET -eq "PASTE_YOUR_FREIGHTER_S_SECRET") {
  Write-Host "ERROR: Set SOROBAN_SOURCE_SECRET in .env to your Freighter S... secret first." -ForegroundColor Red
  exit 1
}

Write-Host "Using source account: $SOURCE" -ForegroundColor Cyan

# --- Register the key as a CLI identity (idempotent) ---
Write-Host "Registering CLI key identity '$KEY_NAME'..." -ForegroundColor Cyan
stellar keys address $KEY_NAME 2>$null
if ($LASTEXITCODE -ne 0) {
  stellar keys add $KEY_NAME --secret $SECRET --network testnet
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

Write-Host "Building contracts..." -ForegroundColor Cyan
Push-Location contracts
cargo build --release --target wasm32-unknown-unknown
Pop-Location

Write-Host "Deploying BountyRegistry..." -ForegroundColor Cyan
$REGISTRY = stellar contract deploy `
  --wasm $WASM_REGISTRY `
  --source $KEY_NAME `
  --rpc-url $RPC `
  --network-passphrase $PASS
Write-Host "BOUNTY_REGISTRY_ADDRESS=$REGISTRY" -ForegroundColor Green

Write-Host "Deploying MergeVerifier..." -ForegroundColor Cyan
$VERIFIER = stellar contract deploy `
  --wasm $WASM_VERIFIER `
  --source $KEY_NAME `
  --rpc-url $RPC `
  --network-passphrase $PASS `
  -- $REGISTRY
Write-Host "MERGE_VERIFIER_ADDRESS=$VERIFIER" -ForegroundColor Green

Write-Host "Initializing MergeVerifier..." -ForegroundColor Cyan
stellar contract invoke `
  --id $VERIFIER `
  --source $KEY_NAME `
  --rpc-url $RPC `
  --network-passphrase $PASS `
  -- initialize `
  --admin $SOURCE `
  --registry_addr $REGISTRY `
  --relay_pub_key $RELAY_PUB_KEY

Write-Host "Authorizing MergeVerifier in BountyRegistry..." -ForegroundColor Cyan
stellar contract invoke `
  --id $REGISTRY `
  --source $KEY_NAME `
  --rpc-url $RPC `
  --network-passphrase $PASS `
  -- set_authorized_caller `
  --caller $VERIFIER

Write-Host "Done. Paste these into your .env files:" -ForegroundColor Cyan
Write-Host "BOUNTY_REGISTRY_ADDRESS=$REGISTRY"
Write-Host "MERGE_VERIFIER_ADDRESS=$VERIFIER"
