import type { Bounty } from '@/types'

export type PlatformStatsSource = 'database' | 'empty' | 'unconfigured'

export interface PlatformStats {
  /** True when at least one stored bounty was counted. */
  indexed: boolean
  source: PlatformStatsSource
  totalBounties: number
  openBounties: number
  paidBounties: number
  /** Sum of amounts still held in escrow for XLM-denominated bounties. */
  totalEscrowXlm: number
}

const OPEN_STATUSES = new Set(['created', 'funded', 'linked', 'verified', 'disputed'])
const ESCROW_STATUSES = new Set(['funded', 'linked', 'verified', 'disputed'])

function isXlm(token: string | null) {
  return !token || token.toUpperCase() === 'XLM'
}

export function computePlatformStats(
  bounties: Bounty[] | null | undefined,
  source: PlatformStatsSource
): PlatformStats {
  const list = Array.isArray(bounties) ? bounties : []
  let openBounties = 0
  let paidBounties = 0
  let totalEscrowXlm = 0

  for (const b of list) {
    if (OPEN_STATUSES.has(b.status)) openBounties++
    if (b.status === 'paid') paidBounties++
    if (ESCROW_STATUSES.has(b.status) && isXlm(b.token)) {
      const amount = Number(b.amount)
      if (Number.isFinite(amount)) totalEscrowXlm += amount
    }
  }

  return {
    indexed: list.length > 0,
    source: list.length > 0 ? source : source === 'unconfigured' ? 'unconfigured' : 'empty',
    totalBounties: list.length,
    openBounties,
    paidBounties,
    totalEscrowXlm,
  }
}
