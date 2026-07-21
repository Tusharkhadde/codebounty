'use client'

import { useRef } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { BountyCard } from '@/components/BountyCard'
import { CreateBountyForm } from '@/components/CreateBountyForm'
import { BountyStepper } from '@/components/BountyStepper'
import { StatsCard } from '@/components/StatsCard'
import { FilterBar } from '@/components/FilterBar'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { InstallFreighter } from '@/components/InstallFreighter'
import type { Bounty, BountyStatus } from '@/types'

// Mock data for display
const mockBounties: Bounty[] = [
  { id: 1, issue_url: 'https://github.com/stellar/soroban/issues/1', amount: 5000, creator: 'user1', status: 'created', token: 'XLM', deadline: 0, linked_pr_url: null, contributor: null, funded_at: 0, paid_at: 0 },
  { id: 2, issue_url: 'https://github.com/stellar/soroban/issues/2', amount: 15000, creator: 'user2', status: 'funded', token: 'XLM', deadline: 0, linked_pr_url: null, contributor: null, funded_at: 0, paid_at: 0 }
]

export default function Home() {
  const { connected, connecting, error, connect, disconnect, freighterInstalled } = useWallet()
  const pageRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={pageRef} className="space-y-[160px] bg-[#08080a] min-h-screen text-[#e2e3e9]">
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 w-full">
        <div className="container-main mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column */}
          <div className="flex flex-col items-start text-left max-w-xl">
            <h1 className="heading-serif text-[64px] md:text-[88px] leading-none mb-6">
              Midnight vault with gilded ledger lines.
            </h1>
            <p className="text-[20px] text-[#9194a1] font-normal leading-[1.38] mb-12 max-w-md">
              Secure your open-source projects on Stellar. Fund issues, verify pull requests, and release bounties automatically.
            </p>
            
            {/* CTA */}
            {!connected ? (
              !freighterInstalled ? (
                <InstallFreighter />
              ) : (
                <div className="flex items-stretch">
                  <input 
                    type="email" 
                    placeholder="Enter email for updates" 
                    className="input-slash rounded-r-none border-r-0 focus:border-r"
                    style={{ borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  />
                  <button 
                    onClick={connect}
                    disabled={connecting}
                    className="btn-primary-slash rounded-l-none"
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  >
                    {connecting ? 'Connecting...' : 'Get Started'}
                  </button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-4">
                <div className="pill-tag text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10">
                  Wallet Connected
                </div>
                <button onClick={disconnect} className="btn-ghost-slash">
                  Disconnect
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 text-sm text-[#ef4444]">
                {error}
              </div>
            )}
          </div>
          
          {/* Right Column (Mock Dashboard Card) */}
          <div className="slash-card relative overflow-hidden flex flex-col justify-between" style={{ minHeight: '400px' }}>
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="text-[14px] text-[#9194a1] mb-2 font-medium tracking-wide uppercase">Total Volume</div>
                <div className="text-[48px] text-white font-medium leading-none tabular-nums">24,500 <span className="text-[24px] text-[#9194a1]">XLM</span></div>
              </div>
              <div className="pill-tag">
                Last 30 Days
              </div>
            </div>
            
            {/* Gilded Chart Line Mockup */}
            <div className="absolute bottom-0 left-0 right-0 h-48 w-full opacity-80" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(174, 147, 87, 0.15) 0%, transparent 70%)'
            }}>
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                <path 
                  d="M0 40 L0 30 Q 15 35, 30 20 T 50 15 T 70 25 T 90 5 L 100 5 L 100 40 Z" 
                  fill="url(#gradientGlow)" 
                />
                <path 
                  d="M0 30 Q 15 35, 30 20 T 50 15 T 70 25 T 90 5 L 100 5" 
                  fill="none" 
                  stroke="url(#gilded)" 
                  strokeWidth="0.5" 
                  vectorEffect="non-scaling-stroke"
                />
                <defs>
                  <linearGradient id="gilded" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(174, 147, 87)" />
                    <stop offset="40%" stopColor="rgb(255, 240, 204)" />
                    <stop offset="70%" stopColor="rgb(174, 147, 87)" />
                    <stop offset="100%" stopColor="rgba(189, 157, 79, 0)" />
                  </linearGradient>
                  <linearGradient id="gradientGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(174, 147, 87, 0.2)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* Stats Callout Section */}
      <section className="container-main mx-auto max-w-[600px] text-center my-[160px]">
        <h2 className="heading-serif text-[44px] mb-4">10,000+</h2>
        <p className="text-[14px] font-normal text-[#9194a1]">
          open source developers secured
        </p>
      </section>

      {/* Feature Grid / Blog Cards Style */}
      <section className="container-main mx-auto mb-[160px]">
        <h3 className="heading-serif text-[44px] mb-12 text-center">Bounty Escrow Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
          
          <div className="rounded-[10px] bg-transparent">
            <div className="h-48 bg-[#1c1d22] rounded-t-[10px] mb-4"></div>
            <div className="text-[13px] font-semibold text-[#cc9166] mb-2 tracking-[-0.02em]">SMART CONTRACTS</div>
            <h4 className="text-[20px] font-medium text-white mb-2 leading-[1.38]">Trustless Escrow Execution</h4>
            <p className="text-[16px] text-[#acafb9] leading-[1.5]">Funds are locked on Soroban and automatically released upon verified GitHub merge.</p>
          </div>

          <div className="rounded-[10px] bg-transparent">
            <div className="h-48 bg-[#1c1d22] rounded-t-[10px] mb-4"></div>
            <div className="text-[13px] font-semibold text-[#cc9166] mb-2 tracking-[-0.02em]">DEVELOPER TOOLS</div>
            <h4 className="text-[20px] font-medium text-white mb-2 leading-[1.38]">Native GitHub Integration</h4>
            <p className="text-[16px] text-[#acafb9] leading-[1.5]">Simply paste an issue URL. We track the pull requests and state changes automatically.</p>
          </div>

          <div className="rounded-[10px] bg-transparent">
            <div className="h-48 bg-[#1c1d22] rounded-t-[10px] mb-4"></div>
            <div className="text-[13px] font-semibold text-[#cc9166] mb-2 tracking-[-0.02em]">GLOBAL PAYMENTS</div>
            <h4 className="text-[20px] font-medium text-white mb-2 leading-[1.38]">Instant USDC & XLM Payouts</h4>
            <p className="text-[16px] text-[#acafb9] leading-[1.5]">Contributors get paid instantly to their Stellar wallet in USDC, anywhere in the world.</p>
          </div>

        </div>
      </section>

    </div>
  )
}
