'use client'

import { useWallet } from '@/contexts/WalletContext'
import { Download, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react'

interface Props {
  className?: string
}

const FREIGHTER_INSTALL_URL = 'https://www.freighter.app'

export function InstallFreighter({ className = '' }: Props) {
  const { enableDemoMode } = useWallet()

  return (
    <div className={`glass-card p-8 border-teal-500/30 animate-fade-in-up ${className}`}>
      <div className="flex flex-col items-center justify-center text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 border border-teal-300/30 flex items-center justify-center shadow-lg shadow-teal-500/10">
          <ShieldCheck className="w-8 h-8 text-teal-300" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-xl font-bold text-white">Freighter Wallet Not Detected</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Freighter is the official non-custodial browser extension for Stellar & Soroban smart contracts.
            Install it to fund escrows and receive instant payouts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm pt-2">
          <a
            href={FREIGHTER_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-xs py-3 justify-center shadow-md shadow-teal-500/20"
          >
            <Download className="w-4 h-4" /> Install Freighter Extension
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          <button
            type="button"
            onClick={enableDemoMode}
            className="btn-secondary w-full text-xs py-3 justify-center text-teal-300 border-teal-500/30 hover:bg-teal-500/10"
          >
            <Sparkles className="w-4 h-4 text-teal-400" /> Try Testnet Demo Mode
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Already installed? Make sure the extension is enabled in your browser settings and unlocked.
        </p>
      </div>
    </div>
  )
}
