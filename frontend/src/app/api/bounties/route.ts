import { NextRequest, NextResponse } from 'next/server'
import type { Bounty } from '@/types'
import { BOUNTIES_STORE } from '@/lib/bounties-store'
import { getBountiesFromDb, saveBountyToDb } from '@/lib/db'
import { requireSession } from '@/lib/auth'
import { dedupeBounties } from '@/lib/bounty-dedupe'

export async function GET() {
  const dbBounties = (await getBountiesFromDb()) || []
  const bounties = dedupeBounties([...dbBounties, ...BOUNTIES_STORE])

  return NextResponse.json({
    success: true,
    bounties,
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = requireSession(request)
    if (session instanceof NextResponse) return session
    const body = await request.json()
    const { id, issueUrl, amount, token, deadline, creator } = body

    if (!issueUrl || !amount || !creator) {
      return NextResponse.json(
        { error: 'Missing required bounty parameters (issueUrl, amount, creator)' },
        { status: 400 }
      )
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const newBounty: Bounty = {
      id: Number.isInteger(Number(id)) ? Number(id) : Date.now(),
      issue_url: issueUrl,
      creator: creator,
      amount: numAmount,
      token: token || 'XLM',
      deadline: parseInt(deadline, 10) || (Math.floor(Date.now() / 1000) + 30 * 86400),
      status: 'funded',
      linked_pr_url: null,
      contributor: null,
      funded_at: Math.floor(Date.now() / 1000),
      paid_at: 0,
      owner_github_login: session.login,
      owner_wallet_address: creator,
    }

    // Persist to Neon DB if connected
    await saveBountyToDb(newBounty)

    // Also update in-memory fallback
    const existingIndex = BOUNTIES_STORE.findIndex(b => b.id === newBounty.id)
    if (existingIndex >= 0) BOUNTIES_STORE[existingIndex] = newBounty
    else BOUNTIES_STORE.unshift(newBounty)

    const relayUrl = process.env.RELAY_URL || process.env.NEXT_PUBLIC_RELAY_URL
    if (relayUrl) {
      await fetch(`${relayUrl.replace(/\/$/, '')}/events/bounty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bountyId: newBounty.id, event: 'bounty.created' }),
      }).catch(() => undefined)
    }

    return NextResponse.json({
      success: true,
      bounty: newBounty,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to create bounty' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const { clearAllBountiesDb } = await import('@/lib/db')
  await clearAllBountiesDb()
  BOUNTIES_STORE.length = 0
  return NextResponse.json({
    success: true,
    message: 'All test bounties cleared successfully',
  })
}
