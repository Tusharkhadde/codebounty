'use client'

import { CreateBountyForm } from '@/components/CreateBountyForm'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Sparkles, Code2 } from 'lucide-react'

export default function CreateBountyPage() {
  return (
    <div className="container-main py-10 space-y-8 max-w-3xl mx-auto">
      <header className="space-y-3">
        <Link
          href="/bounties"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bounties
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="heading-lg">Create New Bounty</h1>
          <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Trustless Escrow
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Attach XLM or USDC rewards to open GitHub issues. Funds are locked safely in a Soroban smart-contract escrow on Stellar until the solver&apos;s pull request is verified as merged.
        </p>
      </header>

      {/* Main Wizard Component */}
      <CreateBountyForm />

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs space-y-2">
          <div className="flex items-center gap-2 text-teal-300 font-bold">
            <ShieldCheck className="w-4 h-4" /> Soroban Smart Contracts
          </div>
          <p className="text-slate-400 leading-relaxed">
            Funds are non-custodial and protected directly on the Stellar blockchain.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Code2 className="w-4 h-4" /> Automated Merge Verifier
          </div>
          <p className="text-slate-400 leading-relaxed">
            Our relay verifies GitHub pull requests automatically before triggering payout.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <Sparkles className="w-4 h-4" /> Instant Payouts
          </div>
          <p className="text-slate-400 leading-relaxed">
            Contributors receive funds straight into their Stellar wallets without delay.
          </p>
        </div>
      </div>
    </div>
  )
}
