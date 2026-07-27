import crypto from 'crypto'

export function extractBountyId(body?: string): number | null {
  if (!body) return null
  for (const pattern of [
    /Bounty\s*ID\s*[:#]\s*(\d+)/i,
    /Closes?\s*bounty\s*[:#]?\s*(\d+)/i,
    /\[#(\d+)\]/,
  ]) {
    const match = body.match(pattern)
    if (match?.[1]) return Number.parseInt(match[1], 10)
  }
  return null
}

export function verifyGithubSignature(payload: string, signature?: string): boolean {
  if (!signature) return false
  const [algorithm, provided] = signature.split('=')
  const secret = process.env.GITHUB_WEBHOOK_SECRET || ''
  if (algorithm !== 'sha256' || !provided || !secret || !/^[a-f0-9]{64}$/i.test(provided)) return false
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'))
}
