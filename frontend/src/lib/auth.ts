import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const sessionName = 'codebounty_session'
export type SessionUser = { login: string; avatarUrl?: string; issuedAt?: number }

function secret() { return process.env.AUTH_SECRET || null }
function sign(value: string, key: string) { return createHmac('sha256', key).update(value).digest('base64url') }

export function getSession(request: NextRequest): SessionUser | null {
  const key = secret(); const raw = request.cookies.get(sessionName)?.value
  if (!key || !raw) return null
  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return null
  const expected = sign(payload, key)
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try { const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')); return typeof user.login === 'string' ? user : null } catch { return null }
}

export function requireSession(request: NextRequest): SessionUser | NextResponse {
  const user = getSession(request)
  return user || NextResponse.json({ error: 'GitHub authentication is required.' }, { status: 401 })
}

export function requireFreshSession(request: NextRequest, maxAgeSeconds = 600): SessionUser | NextResponse {
  const session = requireSession(request)
  if (session instanceof NextResponse) return session
  if (!session.issuedAt || Date.now() / 1000 - session.issuedAt > maxAgeSeconds) {
    return NextResponse.json({ error: 'Re-authentication is required for this sensitive action.', reauthRequired: true }, { status: 403 })
  }
  return session
}
