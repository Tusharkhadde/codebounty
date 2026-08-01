/**
 * CodeBounty Oracle Relay Service
 * 
 * Listens to GitHub webhook events (pull_request.closed), verifies merged PRs,
 * signs attestations, and submits them to the MergeVerifier contract on Soroban.
 * 
 * Environment variables required:
 *   GITHUB_WEBHOOK_SECRET  - Secret configured in GitHub webhook settings
 *   RELAY_PRIVATE_KEY       - Ed25519 private key for signing attestations
 *   SOROBAN_RPC_URL         - Soroban RPC endpoint (e.g., https://rpc-futurenet.stellar.org)
 *   MERGE_VERIFIER_ADDRESS  - Deployed MergeVerifier contract address
 *   BOUNTY_REGISTRY_ADDRESS - Deployed BountyRegistry contract address
 *   PORT                    - HTTP server port (default: 3000)
 */

import express, { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'

dotenv.config()

const app = express()
app.use(express.json())
const httpServer = createServer(app)
const websocketServer = new WebSocketServer({ server: httpServer, path: '/ws' })
const websocketClients = new Set<WebSocket>()
websocketServer.on('connection', socket => {
  websocketClients.add(socket)
  socket.send(JSON.stringify({ type: 'relay.connected' }))
  socket.on('close', () => websocketClients.delete(socket))
})

function broadcastBountyUpdate(bountyId: number, event: string) {
  const message = JSON.stringify({ type: 'bounty.updated', bountyId, event })
  for (const socket of websocketClients) {
    if (socket.readyState === WebSocket.OPEN) socket.send(message)
  }
}

// --- Configuration ---
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || ''
const RELAY_PRIVATE_KEY = process.env.RELAY_PRIVATE_KEY || ''
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://rpc-futurenet.stellar.org'
const MERGE_VERIFIER_ADDRESS = process.env.MERGE_VERIFIER_ADDRESS || ''
const BOUNTY_REGISTRY_ADDRESS = process.env.BOUNTY_REGISTRY_ADDRESS || ''
const PORT = parseInt(process.env.PORT || '3000', 10)

// --- In-memory state ---
// Maps GitHub issue numbers to bounty IDs
const ISSUE_TO_BOUNTY: Map<number, number> = new Map()
// Tracks submitted proofs to prevent replays
const SUBMITTED_PROOFS: Set<string> = new Set()

// --- Types ---
interface GitHubPullRequestEvent {
  action: 'closed' | 'opened' | 'reopened'
  pull_request: {
    url: string
    number: number
    merged: boolean
    merge_commit_sha: string | null
    head: {
      sha: string
      ref: string
    }
    base: {
      repo: {
        full_name: string
      }
    }
    body?: string
    user: {
      login: string
    }
    closes_issues?: Array<{ number: number }>
  }
  repository: {
    full_name: string
    id: number
  }
  sender: {
    login: string
  }
}

export interface GitHubIssueEvent {
  action: 'closed'
  issue: {
    number: number
    body?: string
    user: {
      login: string
    }
    closed_by?: string
  }
  repository: {
    full_name: string
  }
}

// --- Webhook Verification ---
function verifyGithubSignature(payload: string, signature: string | undefined): boolean {
  if (!signature) return false
  
  const [algo, hex] = signature.split('=')
  if (algo !== 'sha256' || !hex) return false
  
  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET)
  const digest = hmac.update(payload).digest('hex')
  
  return crypto.timingSafeEqual(Buffer.from(hex), Buffer.from(digest))
}

// --- Parse bounty ID from PR/Issue body ---
function extractBountyId(body?: string): number | null {
  if (!body) return null
  
  // Look for patterns like "BountyID: 42" or "Closes bounty #42"
  const patterns = [
    /Bounty\s*ID\s*[:#]\s*(\d+)/i,
    /Closes?\s*bounty\s*[:#]?\s*(\d+)/i,
    /\[#(\d+)\]/,
  ]
  
  for (const pattern of patterns) {
    const match = body.match(pattern)
    if (match && match[1]) {
      return parseInt(match[1], 10)
    }
  }
  
  return null
}

// --- Find bounty by issue number ---
async function findBountyForIssue(issueNumber: number): Promise<{ bountyId: number; prUrl: string } | null> {
  // In production, this would query the Soroban contract via RPC
  // For now, check our in-memory mapping
  const bountyId = ISSUE_TO_BOUNTY.get(issueNumber)
  
  if (bountyId === undefined) {
    return null
  }
  
  // The PR URL is constructed from the webhook data
  return { bountyId, prUrl: `https://github.com/placeholder/repo/pull/${issueNumber}` }
}

// --- Sign attestation ---
function signAttestation(bountyId: number, prUrl: string, mergeCommitSha: string): string {
  // In production, use proper Ed25519 signing with RELAY_PRIVATE_KEY
  // For now, create a deterministic hash as placeholder signature
  const message = `${bountyId}|${prUrl}|${mergeCommitSha}|${Date.now()}`
  const signature = crypto.createHash('sha256').update(message).digest()
  
  return signature.toString('hex')
}

// --- Submit proof to MergeVerifier ---
async function submitProof(
  bountyId: number,
  prUrl: string,
  mergeCommitSha: string,
  signature: string
): Promise<boolean> {
  const proofKey = `${bountyId}-${prUrl}-${mergeCommitSha}`
  
  // Replay prevention
  if (SUBMITTED_PROOFS.has(proofKey)) {
    console.log(`[RELAY] Replay detected for proof: ${proofKey}`)
    return false
  }
  
  console.log(`[RELAY] Submitting proof for bounty #${bountyId}`)
  console.log(`  PR: ${prUrl}`)
  console.log(`  Commit: ${mergeCommitSha}`)
  console.log(`  Signature: ${signature.substring(0, 16)}...`)
  
  // In production, this would call the Soroban contract:
  // const contract = new soroban.Contract({ address: MERGE_VERIFIER_ADDRESS, ... })
  // await contract.call('submit_merge_proof', [bountyId, prUrl, mergeCommitSha, signature])
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  SUBMITTED_PROOFS.add(proofKey)
  console.log(`[RELAY] Proof submitted successfully for bounty #${bountyId}`)
  
  return true
}

// --- Main webhook handler ---
async function handleWebhook(event: GitHubPullRequestEvent): Promise<void> {
  console.log(`[WEBHOOK] Received ${event.action} event for PR #${event.pull_request.number}`)
  console.log(`  Repository: ${event.repository.full_name}`)
  console.log(`  Merged: ${event.pull_request.merged}`)
  
  // Only process merged PRs
  if (event.action !== 'closed' || !event.pull_request.merged) {
    console.log('[WEBHOOK] Ignoring non-merged/closed event')
    return
  }
  
  const mergeCommitSha = event.pull_request.merge_commit_sha
  if (!mergeCommitSha) {
    console.log('[WEBHOOK] No merge commit SHA found, skipping')
    return
  }
  
  // Extract bounty ID from PR body or issue reference
  const bountyId = extractBountyId(event.pull_request.body)
  
  if (bountyId === null) {
    console.log('[WEBHOOK] No bounty ID found in PR body')
    // Try to look up by issue number
    const lookup = await findBountyForIssue(event.pull_request.number)
    if (!lookup) {
      console.log('[WEBHOOK] Could not determine bounty for this PR')
      return
    }
    // Use the found bounty
    return
  }
  
  const prUrl = event.pull_request.url
  
  // Sign attestation
  const signature = signAttestation(bountyId, prUrl, mergeCommitSha)
  
  // Submit to MergeVerifier
  const success = await submitProof(bountyId, prUrl, mergeCommitSha, signature)
  
  if (!success) {
    console.log('[WEBHOOK] Failed to submit proof (possible replay)')
    return
  }
  
  console.log('[WEBHOOK] Processing complete')
}

// --- Express Routes ---
app.post('/webhook/github', async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined
  const eventType = req.headers['x-github-event'] as string
  const payload = JSON.stringify(req.body)
  
  // Verify signature
  if (!verifyGithubSignature(payload, signature)) {
    console.log('[AUTH] Invalid webhook signature')
    res.status(401).json({ error: 'Invalid signature' })
    return
  }
  
  // Process GitHub events
  if (eventType === 'push' || eventType === 'pull_request') {
    try {
      const event = req.body as GitHubPullRequestEvent
      await handleWebhook(event)
      if (event.action === 'closed' && event.pull_request.merged) {
        const bountyId = extractBountyId(event.pull_request.body)
        if (bountyId !== null) broadcastBountyUpdate(bountyId, 'pull_request.merged')
      }
      res.status(200).json({ status: 'ok' })
    } catch (err) {
      console.error('[ERROR] Failed to process webhook:', err)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(200).json({ status: 'ignored', event: eventType })
  }
})

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    relay: 'active',
    contracts: {
      mergeVerifier: MERGE_VERIFIER_ADDRESS || 'not configured',
      bountyRegistry: BOUNTY_REGISTRY_ADDRESS || 'not configured',
    },
    proofsSubmitted: SUBMITTED_PROOFS.size,
  })
})

app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    relayKeySet: RELAY_PRIVATE_KEY.length > 0,
    rpcUrl: SOROBAN_RPC_URL,
    submittedProofs: SUBMITTED_PROOFS.size,
    knownBounties: ISSUE_TO_BOUNTY.size,
  })
})

app.post('/events/bounty', (req: Request, res: Response) => {
  const bountyId = Number(req.body?.bountyId)
  const event = typeof req.body?.event === 'string' ? req.body.event : 'bounty.updated'
  if (!Number.isInteger(bountyId)) {
    res.status(400).json({ error: 'bountyId must be an integer' })
    return
  }
  broadcastBountyUpdate(bountyId, event)
  res.status(202).json({ status: 'broadcast' })
})

// Trigger a proof submission for a specific bounty+PR. Expects { bountyId, prUrl }
app.post('/events/release', async (req: Request, res: Response) => {
  const bountyId = Number(req.body?.bountyId)
  const prUrl = typeof req.body?.prUrl === 'string' ? req.body.prUrl : undefined

  if (!Number.isInteger(bountyId) || !prUrl) {
    res.status(400).json({ error: 'bountyId and prUrl are required' })
    return
  }

  try {
    // Fetch PR details from GitHub to get merge commit SHA
    const match = prUrl.trim().match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/)
    if (!match) {
      res.status(400).json({ error: 'Invalid PR URL' })
      return
    }
    const [, owner, repo, pullNumber] = match

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CodeBounty-Relay',
    }
    if (process.env.GITHUB_PERSONAL_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
    }

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, { headers })
    if (!ghRes.ok) {
      res.status(502).json({ error: 'Failed to fetch PR from GitHub' })
      return
    }
    const prData: any = await ghRes.json()
    if (!prData?.merged) {
      res.status(409).json({ error: 'PR is not merged' })
      return
    }

    const mergeCommitSha = prData.merge_commit_sha || ''

    // Sign and submit proof
    const signature = signAttestation(bountyId, prUrl, mergeCommitSha)
    const ok = await submitProof(bountyId, prUrl, mergeCommitSha, signature)

    if (!ok) {
      res.status(500).json({ error: 'Relay failed to submit proof (possible replay)' })
      return
    }

    // Broadcast update so frontends can react
    broadcastBountyUpdate(bountyId, 'pull_request.merged')

    res.status(200).json({ success: true })
  } catch (err) {
    console.error('[RELAY] /events/release error', err)
    res.status(500).json({ error: 'Internal relay error' })
  }
})

// --- Error handling middleware ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err)
  res.status(500).json({ error: 'Internal server error' })
})

// --- Start server ---
httpServer.listen(PORT, () => {
  console.log(`[RELAY] CodeBounty Oracle Relay running on port ${PORT}`)
  console.log(`[RELAY] RPC URL: ${SOROBAN_RPC_URL}`)
  console.log(`[RELAY] MergeVerifier: ${MERGE_VERIFIER_ADDRESS || 'not set'}`)
  console.log(`[RELAY] BountyRegistry: ${BOUNTY_REGISTRY_ADDRESS || 'not set'}`)
  console.log(`[RELAY] Webhook secret: ${GITHUB_WEBHOOK_SECRET ? 'configured' : 'NOT SET'}`)
  console.log(`[RELAY] Relay key: ${RELAY_PRIVATE_KEY ? 'loaded' : 'NOT LOADED'}`)
})

export default app
