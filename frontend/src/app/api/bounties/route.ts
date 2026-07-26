import { NextRequest, NextResponse } from 'next/server'
import type { Bounty } from '@/types'
import { BOUNTIES_STORE } from '@/lib/bounties-store'
import { getBountiesFromDb, saveBountyToDb } from '@/lib/db'
import { requireSession } from '@/lib/auth'

export async function GET() {
  const dbBounties = (await getBountiesFromDb()) || []
  const map = new Map<number, Bounty>()
  dbBounties.forEach(b => map.set(b.id, b))
  BOUNTIES_STORE.forEach(b => {
    if (!map.has(b.id)) map.set(b.id, b)
  })

  return NextResponse.json({
    success: true,
    bounties: Array.from(map.values()),
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = requireSession(request)
    if (session instanceof NextResponse) return session
    const body = await request.json()
    const { issueUrl, amount, token, deadline, creator } = body

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
      id: Math.floor(100 + Math.random() * 9000),
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
    BOUNTIES_STORE.unshift(newBounty)

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
