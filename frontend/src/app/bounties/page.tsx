'use client'

import { useState, useEffect } from 'react'
import { SearchX, Plus } from 'lucide-react'
import { BountyCard } from '@/components/BountyCard'
import { FilterBar } from '@/components/FilterBar'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Bounty, BountyStatus } from '@/types'

export default function BountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] =
    useState<BountyStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'amount' | 'deadline' | 'status'>(
    'deadline'
  )

  useEffect(() => {
    fetch('/api/bounties')
      .then(res => res.json())
      .then(async data => {
        let serverBounties: Bounty[] = []
        if (data.success && Array.isArray(data.bounties)) {
          serverBounties = data.bounties
        }
        // Auto-sync any local bounties created before the database deployment
        try {
          const localSaved = window.localStorage.getItem('codebounty.user-bounties')
          if (localSaved) {
            const userBounties: Bounty[] = JSON.parse(localSaved)
            const serverIds = new Set(serverBounties.map(b => b.id))
            const map = new Map<number, Bounty>()
            userBounties.forEach(b => map.set(b.id, b))
            serverBounties.forEach(b => map.set(b.id, b))
            const merged = Array.from(map.values())
            
            // Push missing local bounties to cloud DB so friends can see them
            for (const localB of userBounties) {
              if (!serverIds.has(localB.id)) {
                fetch('/api/bounties', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    issueUrl: localB.issue_url,
                    amount: String(localB.amount),
                    token: localB.token || 'XLM',
                    deadline: String(localB.deadline),
                    creator: localB.creator,
                  }),
                }).catch(() => {})
              }
            }

            setBounties(merged)
            return
          }
        } catch (e) {
          // ignore
        }
        setBounties(serverBounties)
      })
      .catch(() => {
        try {
          const localSaved = window.localStorage.getItem('codebounty.user-bounties')
          if (localSaved) {
            setBounties(JSON.parse(localSaved))
          }
        } catch (e) {}
      })
      .finally(() => setLoading(false))
  }, [])

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
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-lg">Bounties</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Browse work that needs attention. Filter by reward, deadline, or progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {bounties.length > 0 && (
            <Button
              onClick={async () => {
                if (!confirm('Clear all test bounties from the global database and local storage?')) return
                try {
                  await fetch('/api/bounties', { method: 'DELETE' })
                  window.localStorage.removeItem('codebounty.user-bounties')
                  setBounties([])
                } catch (e) {
                  alert('Failed to clear bounties')
                }
              }}
              variant="outline"
              className="py-2.5 px-3 text-xs font-semibold"
            >
              Clear Test Bounties
            </Button>
          )}

          <Link href="/bounties/create">
            <Button className="py-2.5 px-5 text-xs font-bold shrink-0">
              <Plus className="w-4 h-4 mr-1.5" /> Create New Bounty
            </Button>
          </Link>
        </div>
      </header>

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

      {loading ? (
          <div className="py-16 text-center text-xs text-zinc-400">
          <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading active bounties...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title={searchQuery ? 'No matching bounties' : 'No bounties found'}
          description={
            searchQuery
              ? 'Try a different search term or clear the filter to see everything.'
              : 'Be the first developer to fund a GitHub issue bounty on Soroban!'
          }
          action={
            <Link href="/bounties/create">
              <Button size="sm" className="text-xs">Create a bounty</Button>
            </Link>
          }
        />
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
