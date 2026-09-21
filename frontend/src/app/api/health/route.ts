import { NextResponse } from 'next/server'
import { getPlatformStats } from '@/lib/platform-stats'
import { hasPersistentStorageConfigured } from '@/lib/db'

export async function GET() {
  const stats = await getPlatformStats()
  return NextResponse.json({
    ok: true,
    storage: hasPersistentStorageConfigured(),
    authConfigured: Boolean(process.env.AUTH_SECRET && process.env.GITHUB_OAUTH_CLIENT_ID),
    relayConfigured: Boolean(process.env.RELAY_URL || process.env.NEXT_PUBLIC_RELAY_URL),
    statsIndexed: stats.indexed,
  })
}
