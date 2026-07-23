'use client'

import type { Bounty } from '@/types'
import { formatDate, formatXLM } from '@/utils/formatters'
import { GlowBorderCard } from '@/components/ui/glow-border-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  bounty: Bounty
  onClick?: (bounty: Bounty) => void
}

export function BountyCard({ bounty, onClick }: Props) {
  const router = useRouter()
  const formatAmount = (amount: number): string => {
    return formatXLM(amount)
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(bounty)
    } else {
      router.push(`/bounties/${bounty.id}`)
    }
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      created: 'Created',
      funded: 'Funded',
      linked: 'PR Linked',
      verified: 'Verified',
      paid: 'Paid Out',
      cancelled: 'Cancelled',
      disputed: 'Disputed',
    }
    return labels[status] || status
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info' => {
    const map: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info'> = {
      created: 'secondary',
      funded: 'info',
      linked: 'default',
      verified: 'success',
      paid: 'success',
      cancelled: 'destructive',
      disputed: 'warning',
    }
    return map[status] || 'default'
  }

  const isClaimable = bounty.status === 'linked' || bounty.status === 'verified'
  const isExpired = bounty.deadline && Date.now() / 1000 > bounty.deadline

  return (
    <GlowBorderCard
      className="flex flex-col h-full cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
      colorPreset="stellar"
      onClick={handleCardClick}
      borderRadius="1.125rem"
      inset="-0.5rem"
    >
      <div className="flex flex-col h-full w-full">
      {/* Header with status */}
      <div className="flex items-start justify-between mb-4">
        <Badge variant={getStatusVariant(bounty.status)}>
          <span className="status-dot" />
          {getStatusLabel(bounty.status)}
        </Badge>
        {isExpired && (
          <Badge variant="destructive">
            <span className="status-dot" />
            Expired
          </Badge>
        )}
      </div>

      {/* Amount with gradient */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {formatAmount(bounty.amount)}
          </span>
        </div>
        {bounty.token && (
          <span className="text-xs text-gray-500 mt-0.5 font-medium">{bounty.token}</span>
        )}
      </div>

      {/* Issue URL */}
      <h3 className="font-medium mb-3 text-sm leading-relaxed">
        <a
          href={bounty.issue_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-[var(--accent)] transition-colors line-clamp-2 group-hover:text-[var(--accent)]"
          onClick={(e) => e.stopPropagation()}
        >
          {bounty.issue_url.replace('https://github.com/', '')}
        </a>
      </h3>

      {/* Details */}
      <div className="space-y-2.5 text-xs text-gray-400 mb-4 flex-1">
        <div className="flex items-center gap-2.5 group/item hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0 group-hover/item:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate font-mono text-[11px]">{bounty.creator}</span>
        </div>
        
        {bounty.deadline && (
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={isExpired ? 'text-red-400 font-medium' : ''}>
              {isExpired ? 'Expired' : `Due: ${formatDate(bounty.deadline * 1000)}`}
            </span>
          </div>
        )}

        {bounty.linked_pr_url && (
          <div className="flex items-center gap-2.5 group/link">
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0 group-hover/link:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <a
              href={bounty.linked_pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-green-300 hover:underline truncate transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {bounty.linked_pr_url.replace('https://github.com/', '')}
            </a>
          </div>
        )}

        {bounty.contributor && (
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-400">Contributor assigned</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-white/10">
        {isClaimable && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
            }}
            size="sm"
            className={cn('flex-1 text-xs py-2.5')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Claim Bounty
          </Button>
        )}
        <Button asChild variant="secondary" size="sm" className="text-xs px-3 py-2.5">
          <a
            href={bounty.issue_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View
          </a>
        </Button>
      </div>
      </div>
    </GlowBorderCard>
  )
}
