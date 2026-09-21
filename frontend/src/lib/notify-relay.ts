type RelayResult = { sent: boolean; status?: number; reason?: 'not_configured' | 'unreachable' }

function relayBaseUrl() {
  return (process.env.RELAY_URL || process.env.NEXT_PUBLIC_RELAY_URL || '').replace(/\/$/, '')
}

function relayHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (process.env.RELAY_INTERNAL_SECRET) {
    headers['x-relay-secret'] = process.env.RELAY_INTERNAL_SECRET
  }
  return headers
}

async function postRelay(path: string, payload: Record<string, unknown>): Promise<RelayResult> {
  const base = relayBaseUrl()
  if (!base) return { sent: false, reason: 'not_configured' }

  try {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: relayHeaders(),
      body: JSON.stringify(payload),
    })
    return { sent: response.ok, status: response.status }
  } catch {
    return { sent: false, reason: 'unreachable' }
  }
}

export function notifyRelayBountyCreated(payload: {
  bountyId: number
  event?: string
  issueUrl?: string
}) {
  return postRelay('/events/bounty', {
    bountyId: payload.bountyId,
    event: payload.event || 'bounty.created',
    issueUrl: payload.issueUrl,
  })
}

export function requestRelayRelease(payload: { bountyId: number; prUrl: string }) {
  return postRelay('/events/release', payload)
}
