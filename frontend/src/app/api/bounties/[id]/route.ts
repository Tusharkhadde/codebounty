import { NextRequest, NextResponse } from 'next/server'
import { BOUNTIES_STORE } from '@/lib/bounties-store'
import { getBountiesFromDb, saveBountyToDb } from '@/lib/db'
import { requireFreshSession, requireSession } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'

async function findBounty(id: number) {
  const stored = await getBountiesFromDb()
  const merged = [...(stored || []), ...BOUNTIES_STORE]
  return merged.find(b => b.id === id)
}

async function verifyPullRequestMerged(prUrl: string) {
  const match = prUrl.trim().match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)\/?$/)
  if (!match) return false

  const [, owner, repo, pullNumber] = match
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CodeBounty-App',
  }

  if (process.env.GITHUB_PERSONAL_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_PERSONAL_TOKEN}`
  }

  const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, {
    headers,
    next: { revalidate: 60 },
  })

  if (!ghRes.ok) return false
  const data = await ghRes.json()
  return Boolean(data?.merged_at)
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const bounty = await findBounty(Number(params.id))
  return bounty ? NextResponse.json({ success: true, bounty }) : NextResponse.json({ error: 'Bounty not found' }, { status: 404 })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = requireSession(request)
  if (session instanceof NextResponse) return session

  const bounty = await findBounty(Number(params.id))
  if (!bounty) return NextResponse.json({ error: 'Bounty not found' }, { status: 404 })

  const { action, prUrl, contributor, walletAddress } = await request.json()

  if (action === 'link_pr') {
    if (!prUrl || !/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+\/?$/.test(prUrl)) {
      return NextResponse.json({ error: 'A valid GitHub pull request URL is required.' }, { status: 400 })
    }

    if (bounty.owner_github_login === session.login) {
      return NextResponse.json({ error: 'Bounty owners cannot apply to their own bounty.' }, { status: 403 })
    }

    if (bounty.contributor) {
      return NextResponse.json({ error: 'This bounty already has a submission.' }, { status: 409 })
    }

    const resolvedWalletAddress = walletAddress || contributor
    if (!resolvedWalletAddress) {
      return NextResponse.json({ error: 'A verified wallet address is required.' }, { status: 400 })
    }

    bounty.linked_pr_url = prUrl
    bounty.contributor = resolvedWalletAddress
    bounty.status = 'linked'
    await saveBountyToDb(bounty)
    return NextResponse.json({ success: true, bounty })
  }

  if (!bounty.owner_github_login || bounty.owner_github_login !== session.login) {
    return NextResponse.json({ error: 'Only the bounty owner can perform this action.' }, { status: 403 })
  }

  if (!['cancel', 'pay'].includes(action)) {
    return NextResponse.json({ error: 'Unknown action specified' }, { status: 400 })
  }

  const fresh = requireFreshSession(request)
  if (fresh instanceof NextResponse) return fresh

  const resolvedPaymentAddress = walletAddress || bounty.contributor
  if (!resolvedPaymentAddress) {
    return NextResponse.json({ error: 'No contributor wallet is available for payout.' }, { status: 400 })
  }

  if (walletAddress && !bounty.contributor) {
    bounty.contributor = walletAddress
  }

  const previousState = bounty.status

  if (action === 'cancel') {
    bounty.status = 'cancelled'
  } else {
    if (!bounty.linked_pr_url) {
      return NextResponse.json({ error: 'A linked pull request is required before payout.' }, { status: 400 })
    }

    const merged = await verifyPullRequestMerged(bounty.linked_pr_url)
    if (!merged) {
      return NextResponse.json({ error: 'The linked pull request is not merged yet. Payout can only be released after merge.', status: 400 })
    }

    bounty.status = 'paid'
    bounty.paid_at = Math.floor(Date.now() / 1000)
  }

  await saveBountyToDb(bounty)

  const prisma = getPrisma()
  if (prisma) {
    await prisma.auditLog
      .create({
        data: {
          bountyId: bounty.id,
          githubLogin: session.login,
          walletAddress: resolvedPaymentAddress || bounty.owner_wallet_address,
          action,
          previousState,
          newState: bounty.status,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        },
      })
      .catch(() => undefined)
  }

  return NextResponse.json({ success: true, bounty })
}
