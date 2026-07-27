import type { Bounty } from '@/types'

/** Keep one canonical record per on-chain/database bounty identity. */
export function dedupeBounties(bounties: Bounty[]): Bounty[] {
  const byId = new Map<number, Bounty>()
  for (const bounty of bounties) {
    if (!Number.isFinite(Number(bounty.id))) continue
    byId.set(Number(bounty.id), { ...bounty, id: Number(bounty.id) })
  }
  return Array.from(byId.values())
}
