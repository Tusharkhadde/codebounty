'use client'

import { CreateBountyForm } from '@/components/CreateBountyForm'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Code2 } from 'lucide-react'
import { ProtectedActionGate } from '@/components/ProtectedActionGate'

export default function CreateBountyPage() {
  return (
    <div className="py-4 space-y-8 max-w-3xl mx-auto">
      <header className="space-y-3">
        <Link
          href="/bounties"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bounties
        </Link>
        <h1 className="heading-lg">Create a bounty</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Attach XLM or USDC rewards to open GitHub issues. Funds are locked safely in a Soroban smart-contract escrow on Stellar until the solver&apos;s pull request is verified as merged.
        </p>
      </header>

      <ProtectedActionGate action="create a bounty"><CreateBountyForm /></ProtectedActionGate>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs space-y-2">
          <div className="flex items-center gap-2 text-zinc-200 font-bold">
            <ShieldCheck className="w-4 h-4" /> Soroban Smart Contracts
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Funds are non-custodial and protected directly on the Stellar blockchain.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs space-y-2">
          <div className="flex items-center gap-2 text-zinc-200 font-bold">
            <Code2 className="w-4 h-4" /> Automated Merge Verifier
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Our relay verifies GitHub pull requests automatically before triggering payout.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs space-y-2">
          <div className="flex items-center gap-2 text-zinc-200 font-bold">
            <Code2 className="w-4 h-4" /> Clear Payout Path
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Contributors receive funds straight into their Stellar wallets without delay.
          </p>
        </div>
      </div>
    </div>
  )
}
