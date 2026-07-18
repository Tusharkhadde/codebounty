'use client'

import type { BountyStatus } from '@/types'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  statuses: BountyStatus[]
  statusCounts?: Partial<Record<BountyStatus, number>>
  selectedStatus: BountyStatus | 'all'
  onSelectStatus: (status: BountyStatus | 'all') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'amount' | 'deadline' | 'status'
  onSortChange: (sort: 'amount' | 'deadline' | 'status') => void
  totalCount: number
  filteredCount: number
}

export function FilterBar({
  statuses,
  statusCounts = {},
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
}: Props) {
  return (
    <Card className="p-5 space-y-4 animate-fade-in" aria-label="Bounty filters">
      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            aria-label="Search bounties"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bounties..."
            className="pl-10"
          />
        </div>

        {/* Sort Select */}
        <select
          aria-label="Sort bounties"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'amount' | 'deadline' | 'status')}
          className="input-field w-full sm:w-44"
        >
          <option value="deadline">Sort: Deadline</option>
          <option value="amount">Sort: Amount</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onSelectStatus('all')}
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          size="sm"
          className={cn('rounded-full')}
        >
          All ({totalCount})
        </Button>
        
        {statuses.map((status) => {
          const count = statusCounts[status] ?? 0
          return (
            <Button
              key={status}
              onClick={() => onSelectStatus(status)}
              variant={selectedStatus === status ? 'default' : 'outline'}
              size="sm"
              className={cn('rounded-full')}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-[11px] font-bold">
                  {count}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm pt-3 border-t border-white/5">
        <p className="text-gray-400">
          Showing <span className="text-white font-semibold">{filteredCount}</span> of <span className="text-white font-semibold">{totalCount}</span> bounties
        </p>
        {searchQuery && (
          <Button
            onClick={() => onSearchChange('')}
            variant="ghost"
            size="sm"
            className="text-teal-400 hover:text-teal-300 font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear search
          </Button>
        )}
      </div>
    </Card>
  )
}
