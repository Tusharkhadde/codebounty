    'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useWallet } from '@/contexts/WalletContext'
import { BountyCard } from '@/components/BountyCard'
import { CreateBountyForm } from '@/components/CreateBountyForm'
import { BountyStepper } from '@/components/BountyStepper'
import { StatsCard } from '@/components/StatsCard'
import { FilterBar } from '@/components/FilterBar'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import type { Bounty, BountyStatus } from '@/types'

gsap.registerPlugin(useGSAP)

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null)
  const { connected, connecting, error, connect, disconnect } = useWallet()
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse')
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<BountyStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'amount' | 'deadline' | 'status'>('deadline')

  useEffect(() => {
    // Contract event indexing is intentionally kept behind this boundary until
    // a deployed registry address is configured. Never present fabricated
    // bounties as if they came from Soroban.
    setBounties([])
    return
    const mockBounties: Bounty[] = [
      {
        id: 1,
        issue_url: 'https://github.com/example/repo/issues/42',
        creator: 'GDTESTCREATOR123...',
        amount: 50000000,
        token: null,
        deadline: 99999999,
        status: 'funded',
        linked_pr_url: 'https://github.com/example/repo/pull/43',
        contributor: 'GDTESTCONTRIBUTOR123...',
        funded_at: 1000,
        paid_at: 0,
      },
      {
        id: 2,
        issue_url: 'https://github.com/example/project/issues/100',
        creator: 'GDTESTCREATOR456...',
        amount: 100000000,
        token: null,
        deadline: 99999999,
        status: 'created',
        linked_pr_url: null,
        contributor: null,
        funded_at: 0,
        paid_at: 0,
      },
      {
        id: 3,
        issue_url: 'https://github.com/example/app/issues/55',
        creator: 'GDTESTCREATOR789...',
        amount: 25000000,
        token: null,
        deadline: 99999999,
        status: 'linked',
        linked_pr_url: 'https://github.com/example/repo/pull/56',
        contributor: 'GDTESTCONTRIB2...',
        funded_at: 500,
        paid_at: 0,
      },
      {
        id: 4,
        issue_url: 'https://github.com/example/ stellar/issues/20',
        creator: 'GDTESTCREATORABC...',
        amount: 75000000,
        token: null,
        deadline: 99999999,
        status: 'paid',
        linked_pr_url: 'https://github.com/example/repo/pull/21',
        contributor: 'GDTESTCONTRIB3...',
        funded_at: 200,
        paid_at: 800,
      },
      {
        id: 5,
        issue_url: 'https://github.com/example/web3/issues/78',
        creator: 'GDTESTCREATORDEF...',
        amount: 150000000,
        token: null,
        deadline: 99999999,
        status: 'verified',
        linked_pr_url: 'https://github.com/example/repo/pull/79',
        contributor: 'GDTESTCONTRIB4...',
        funded_at: 300,
        paid_at: 0,
      },
      {
        id: 6,
        issue_url: 'https://github.com/example/smart-contract/issues/15',
        creator: 'GDTESTCREATORGHI...',
        amount: 200000000,
        token: null,
        deadline: 99999999,
        status: 'created',
        linked_pr_url: null,
        contributor: null,
        funded_at: 0,
        paid_at: 0,
      },
    ]
    setBounties(mockBounties)
  }, [])

  const handleConnect = async () => {
    try {
      await connect()
    } catch {
      // Error handled by context
    }
  }

  // Filter and sort bounties
  const filteredBounties = bounties
    .filter(bounty => {
      if (selectedStatus !== 'all' && bounty.status !== selectedStatus) {
        return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          bounty.issue_url.toLowerCase().includes(query) ||
          bounty.creator.toLowerCase().includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.amount - a.amount
        case 'deadline':
          return a.deadline - b.deadline
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  // Get unique statuses
  const uniqueStatuses = Array.from(new Set(bounties.map(b => b.status))) as BountyStatus[]
  const statusCounts = bounties.reduce<Partial<Record<BountyStatus, number>>>((counts, bounty) => {
    counts[bounty.status] = (counts[bounty.status] ?? 0) + 1
    return counts
  }, {})

  // Calculate stats
  const totalBounties = bounties.length
  const totalValue = bounties.reduce((sum, b) => sum + b.amount, 0)
  const fundedCount = bounties.filter(b => b.status === 'funded' || b.status === 'paid').length
  const paidCount = bounties.filter(b => b.status === 'paid').length

  useGSAP(() => {
    const mm = gsap.matchMedia()
    
    mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, ({ conditions }) => {
      const reduceMotion = Boolean(conditions?.reduceMotion)
      const duration = reduceMotion ? 0 : 0.8
      const staggerDelay = reduceMotion ? 0 : 0.1
      
      // Hero section entrance
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration } })
      
      heroTl
        .from('.hero-badge', { 
          autoAlpha: 0, 
          scale: 0.8, 
          y: reduceMotion ? 0 : 30,
          duration: duration * 0.8 
        })
        .from('.hero-title', { 
          autoAlpha: 0, 
          y: reduceMotion ? 0 : 40,
          duration: duration * 1.2 
        }, '-=0.4')
        .from('.hero-subtitle', { 
          autoAlpha: 0, 
          y: reduceMotion ? 0 : 20,
          duration: duration * 0.8 
        }, '-=0.6')
        .from('.hero-cta', { 
          autoAlpha: 0, 
          y: reduceMotion ? 0 : 20,
          duration: duration * 0.8,
          stagger: staggerDelay 
        }, '-=0.4')
        .from('.hero-error', { 
          autoAlpha: 0, 
          y: reduceMotion ? 0 : 15,
          duration: duration * 0.6 
        }, '-=0.2')
      
      // Stats cards with stagger
      gsap.from('.dashboard-stat', { 
        autoAlpha: 0, 
        y: reduceMotion ? 0 : 30,
        scale: reduceMotion ? 1 : 0.95,
        duration, 
        stagger: 0.08,
        delay: 0.3,
        ease: 'back.out(1.4)'
      })
      
      // Content sections
      gsap.from('.content-section', { 
        autoAlpha: 0, 
        y: reduceMotion ? 0 : 40,
        duration, 
        delay: 0.5,
        ease: 'power2.out' 
      })
      
      // Feature cards
      gsap.from('.feature-card', { 
        autoAlpha: 0, 
        y: reduceMotion ? 0 : 30,
        scale: reduceMotion ? 1 : 0.98,
        duration: 0.7, 
        stagger: 0.1,
        delay: 0.6,
        ease: 'power3.out' 
      })
    }, pageRef)
    
    return () => mm.revert()
  }, { scope: pageRef })

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb w-96 h-96 bg-purple-500/20 top-10 left-10" style={{ animationDelay: '0s' }} />
          <div className="floating-orb w-72 h-72 bg-green-500/15 bottom-10 right-10" style={{ animationDelay: '5s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-300 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            STELLAR / FUTURENET
          </div>
          
          {/* Title */}
          <h1 className="hero-title heading-xl mb-6">
            <span className="text-gradient">Code</span>Bounty
          </h1>
          
          {/* Subtitle */}
          <p className="hero-subtitle text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
           Transform open source collaboration with trustless bounties. Fund issues, verify merges, and reward contributors—all powered by Soroban smart contracts on Stellar.
         </p>

         {/* CTA Buttons */}
         <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
           {!connected ? (
             <button
               onClick={handleConnect}
               disabled={connecting}
               className="btn-primary text-base px-8 py-4 animate-pulse-glow flex items-center gap-2"
             >
               {connecting ? (
                 <span className="flex items-center gap-2">
                   <span className="loading-spinner" />
                   Connecting...
                 </span>
               ) : (
                 <>
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                   Connect Wallet
                 </>
               )}
             </button>
           ) : (
             <>
               <div className="flex items-center gap-2 px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                 </span>
                 <span className="text-green-300 font-medium">Connected</span>
               </div>
               <button
                 onClick={disconnect}
                 className="btn-secondary"
               >
                 Disconnect
               </button>
             </>
           )}
           
           <a
             href="https://github.com"
             target="_blank"
             rel="noopener noreferrer"
             className="btn-ghost flex items-center gap-2"
           >
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
             </svg>
             View on GitHub
           </a>
         </div>
         
         {error && (
           <div className="hero-error mt-8">
             <ErrorState
               message={error || 'Unknown wallet error'}
               onRetry={handleConnect}
               className="max-w-md mx-auto"
             />
           </div>
         )}
       </div>
     </section>

       {/* Stats Grid */}
       <section className="content-section dashboard-stat grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatsCard
           label="Total Bounties"
           value={totalBounties}
           icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m3 0h3m-3 0v3m0-3V7m0 3h3" /></svg>}
           trend={{ value: 12, positive: true }}
           gradient="from-blue-500 to-cyan-500"
         />
         <StatsCard
           label="Total Value"
           value={`${(totalValue / 10000000).toLocaleString('en-US', { maximumFractionDigits: 1 })} XLM`}
           icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           trend={{ value: 8.5, positive: true }}
           gradient="from-purple-500 to-pink-500"
         />
         <StatsCard
           label="Funded"
           value={fundedCount}
           icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
         />
         <StatsCard
           label="Completed"
           value={paidCount}
           icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           trend={{ value: 3, positive: true }}
           gradient="from-green-500 to-emerald-500"
         />
       </section>

       {/* Tab Navigation */}
       <div className="content-section flex items-center justify-between">
         <div className="flex gap-1 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
           <button
             onClick={() => setActiveTab('browse')}
             className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
               activeTab === 'browse'
                 ? 'tab-active'
                 : 'tab-inactive'
             }`}
           >
             <span className="relative flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
               </svg>
               Browse ({filteredBounties.length})
             </span>
           </button>
           <button
             onClick={() => setActiveTab('create')}
             className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
               activeTab === 'create'
                 ? 'tab-active'
                 : 'tab-inactive'
             }`}
           >
             <span className="relative flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               Create
             </span>
           </button>
         </div>
       </div>

      {/* Create Bounty Form */}
      {activeTab === 'create' && (
        <section className="max-w-2xl mx-auto animate-fade-in-up">
          <CreateBountyForm />
        </section>
      )}

      {/* Browse Bounties */}
      {activeTab === 'browse' && (
        <section className="space-y-6 animate-fade-in-up delay-200">
          {/* Filter Bar */}
          <FilterBar
            statuses={uniqueStatuses}
            statusCounts={statusCounts}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={bounties.length}
            filteredCount={filteredBounties.length}
          />

          {/* Bounty Grid */}
          {loading ? (
            <LoadingState message="Loading bounties..." />
          ) : filteredBounties.length === 0 ? (
            <div className="glass-card text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No bounties found</h3>
              <p className="text-gray-400 text-sm mb-4">
                {searchQuery || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Be the first to create a bounty!'}
              </p>
              {searchQuery || selectedStatus !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedStatus('all')
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                >
                  Create Bounty
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBounties.map((bounty, index) => (
                <div
                  key={bounty.id}
                  className="stagger-item"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <BountyCard bounty={bounty} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* How It Works Section */}
      <section className="mt-8 pt-8 border-t border-white/10">
        <h2 className="heading-md text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: '📝', title: 'Create Issue', desc: 'Open a GitHub issue describing the bug or feature' },
            { icon: '💰', title: 'Fund Bounty', desc: 'Lock funds in a Stellar smart contract escrow' },
            { icon: '🔗', title: 'Submit PR', desc: 'Contributors submit pull requests to fix the issue' },
            { icon: '🎉', title: 'Get Paid', desc: 'Funds released instantly when PR is merged' },
          ].map((step, index) => (
            <div key={index} className="feature-card animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="feature-icon">{step.icon}</div>
              <div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
              {/* Arrow between steps (except last) */}
              {index < 3 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bounty Lifecycle Demo */}
      <section className="mt-8 pt-8 border-t border-white/10">
        <h2 className="heading-md text-center mb-8">Bounty Lifecycle</h2>
        <div className="max-w-3xl mx-auto">
          <BountyStepper currentStep="pr_linked" />
        </div>
      </section>
    </div>
  )
}
