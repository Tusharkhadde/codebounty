import { getBountiesFromDb, hasPersistentStorageConfigured } from '@/lib/db'
import { computePlatformStats, type PlatformStats } from '@/lib/bounty-stats'

export type { PlatformStats } from '@/lib/bounty-stats'

/** Aggregate bounty totals from persistent storage. Never throws. */
export async function getPlatformStats(): Promise<PlatformStats> {
  if (!hasPersistentStorageConfigured()) {
    return computePlatformStats([], 'unconfigured')
  }
  try {
    const bounties = await getBountiesFromDb()
    return computePlatformStats(bounties, 'database')
  } catch (err) {
    console.error('Failed to compute platform stats:', err)
    return computePlatformStats([], 'empty')
  }
}
