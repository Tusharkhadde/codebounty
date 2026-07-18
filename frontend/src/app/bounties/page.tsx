'use client'

import { useState } from 'react'
import { BountyCard } from '@/components/BountyCard'
import { FilterBar } from '@/components/FilterBar'
import { useWallet } from '@/contexts/WalletContext'
import type { Bounty, BountyStatus } from '@/types'

export default function BountiesPage() {
  const { connected } = useWallet()
  const [bounties] = useState<Bounty[]>([])
  const [selectedStatus, setSelectedStatus] =
    useState<BountyStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'amount' | 'deadline' | 'status'>(
    'deadline'
  )

  const filtered = bounties
    .filter(b => selectedStatus === 'all' || b.status === selectedStatus)
    .filter(
      b =>
        !searchQuery ||
        b.issue_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.creator.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === 'amount'
        ? b.amount - a.amount
        : sortBy === 'status'
          ? a.status.localeCompare(b.status)
          : a.deadline - b.deadline
    )

  const statuses = Array.from(new Set(bounties.map(b => b.status))) as BountyStatus[]
  const statusCounts = bounties.reduce<Partial<Record<BountyStatus, number>>>(
    (acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1
      return acc
    },
    {}
  )

  return (
    <div className="container-main py-10 space-y-8">
      <header>
        <h1 className="heading-lg mb-2">Bounties</h1>
        <p className="text-gray-400 max-w-2xl">
          Browse trustless bounties funded on Stellar. Each bounty locks funds in
          a Soroban escrow and releases them when the linked pull request merges.
        </p>
      </header>

      {connected && (
        <FilterBar
          statuses={statuses}
          statusCounts={statusCounts}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={bounties.length}
          filteredCount={filtered.length}
        />
      )}

      {filtered.length === 0 ? (
        <div className="glass-card text-center py-16 animate-fade-in-up">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No bounties found</h3>
          <p className="text-gray-400 text-sm">
            Event indexing is pending a configured registry address. Be the first
            to create a bounty!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(b => (
            <BountyCard key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </div>
  )
}
