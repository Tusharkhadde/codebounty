/**
 * Format amount to XLM display string.
 */
export function formatXLM(amount: number): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  })} XLM`
}

/**
 * Format an amount with its token. Bounties without a stored token predate
 * token selection and were XLM. USDC is shown first-class because it is the
 * default: developers think in dollars.
 */
export function formatTokenAmount(amount: number, token?: string | null): string {
  const symbol = (token || 'XLM').toUpperCase()
  if (symbol === 'XLM') return formatXLM(amount)
  const digits = symbol === 'USDC' ? 2 : 7
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
    useGrouping: false,
  })} ${symbol}`
}

/**
 * Approximate USD value for stablecoin amounts (USDC is 1:1 with USD).
 * Returns null for volatile assets like XLM, where we don't show a guess.
 */
export function usdHint(amount: number, token?: string | null): string | null {
  if ((token || '').toUpperCase() !== 'USDC') return null
  return `≈ $${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Format number with abbreviation (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  if (months < 12) return `${months}mo ago`
  return `${years}y ago`
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 1) return address
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}