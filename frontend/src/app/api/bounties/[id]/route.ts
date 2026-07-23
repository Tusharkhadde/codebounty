import { NextRequest, NextResponse } from 'next/server'
import { BOUNTIES_STORE } from '@/lib/bounties-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const bountyId = parseInt(params.id, 10)
  const bounty = BOUNTIES_STORE.find(b => b.id === bountyId)

  if (!bounty) {
    return NextResponse.json(
      { error: `Bounty with ID ${params.id} not found` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    bounty,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bountyId = parseInt(params.id, 10)
    const bounty = BOUNTIES_STORE.find(b => b.id === bountyId)

    if (!bounty) {
      return NextResponse.json(
        { error: `Bounty with ID ${params.id} not found` },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { action, prUrl, contributor } = body

    if (action === 'link_pr') {
      if (!prUrl || !/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+$/.test(prUrl)) {
        return NextResponse.json(
          { error: 'Valid GitHub Pull Request URL is required (e.g. https://github.com/owner/repo/pull/123)' },
          { status: 400 }
        )
      }

      bounty.linked_pr_url = prUrl
      bounty.contributor = contributor || 'GCONTRIBUTOR99999999999999999999999999999999999'
      bounty.status = 'linked'

      return NextResponse.json({
        success: true,
        message: 'Pull Request linked to bounty escrow!',
        bounty,
      })
    }

    if (action === 'pay') {
      bounty.status = 'paid'
      bounty.paid_at = Math.floor(Date.now() / 1000)

      return NextResponse.json({
        success: true,
        message: 'Escrow payment released to contributor!',
        bounty,
      })
    }

    return NextResponse.json(
      { error: 'Unknown action specified' },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update bounty' },
      { status: 500 }
    )
  }
}
