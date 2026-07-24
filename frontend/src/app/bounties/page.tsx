'use client'

import { useState, useEffect } from 'react'
import { SearchX, Plus, Sparkles } from 'lucide-react'
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
      .then(data => {
        let serverBounties: Bounty[] = []
        if (data.success && Array.isArray(data.bounties)) {
          serverBounties = data.bounties
        }
        // Load user-created bounties from localStorage
        try {
          const localSaved = window.localStorage.getItem('codebounty.user-bounties')
          if (localSaved) {
            const userBounties: Bounty[] = JSON.parse(localSaved)
            // Merge and deduplicate by ID
            const map = new Map<number, Bounty>()
            userBounties.forEach(b => map.set(b.id, b))
            serverBounties.forEach(b => map.set(b.id, b))
            setBounties(Array.from(map.values()))
            return
          }
        } catch (e) {
          // ignore
        }
        setBounties(serverBounties)
      })
      .catch(() => {
        // Fallback to localStorage if API fails
        try {
          const localSaved = window.localStorage.getItem('codebounty.user-bounties')
          if (localSaved) {
            setBounties(JSON.parse(localSaved))
          }
        } catch (e) {
          // ignore
        }
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
    <div className="container-main py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="heading-lg">Bounties</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Soroban Escrows
            </span>
          </div>
          <p className="text-gray-400 max-w-2xl text-xs md:text-sm">
            Browse trustless bounties funded on Stellar. Each bounty locks funds in
            a Soroban escrow and releases them when the linked pull request merges.
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
              className="py-2.5 px-3 text-xs font-semibold border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            >
              Clear Test Bounties
            </Button>
          )}

          <Link href="/bounties/create">
            <Button className="py-2.5 px-5 text-xs font-bold shrink-0 shadow-lg shadow-teal-500/20">
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
        <div className="py-16 text-center text-xs text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
