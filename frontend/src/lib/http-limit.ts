import { NextRequest, NextResponse } from 'next/server'

type Bucket = { count: number; resetAt: number }

// Best-effort, per-instance fixed-window limiter (resets on cold start).
const buckets = new Map<string, Bucket>()

function clientId(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'
  )
}

/**
 * Returns a 429 response when the caller exceeded `limit` requests in `windowMs`
 * for this `scope`, otherwise null.
 */
export function rejectIfRateLimited(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now()
  const key = `${scope}:${clientId(request)}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
    }
    return null
  }

  bucket.count++
  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }
  return null
}
