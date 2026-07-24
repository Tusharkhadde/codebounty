import { NextRequest, NextResponse } from 'next/server'
import type { Bounty } from '@/types'
import { BOUNTIES_STORE } from '@/lib/bounties-store'
import { getBountiesFromDb, saveBountyToDb } from '@/lib/db'

export async function GET() {
  const dbBounties = await getBountiesFromDb()
  const list = dbBounties && dbBounties.length > 0 ? dbBounties : BOUNTIES_STORE

  return NextResponse.json({
    success: true,
    bounties: list,
  })
}

export async function POST(request: NextRequest) {
  try {
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