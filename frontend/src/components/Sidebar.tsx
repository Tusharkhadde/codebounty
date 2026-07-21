'use client'

import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const { connected, connecting, error, disconnect, address } = useWallet()

  const formatAddress = (addr: string | null): string => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <aside aria-label="Main navigation" className="bg-[#06080d]/80 backdrop-blur-xl border-r border-white/10 sticky top-0 h-screen w-64 flex-shrink-0 flex flex-col z-50">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-300 to-cyan-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-teal-500/40 transition-all duration-300 group-hover:scale-110">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold">
            <span className="text-gradient">Code</span>
            <span className="text-slate-400">Bounty</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <Link href="/" className="nav-link-active w-full block">
          Dashboard
        </Link>
        <Link href="/bounties" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 block w-full">
          Bounties
        </Link>
        <Link href="/about" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 block w-full">
          About
        </Link>
        <Link href="/profile" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5 block w-full">
          Profile
        </Link>
      </div>

      {/* Footer / Wallet Connection */}
      <div className="p-4 border-t border-white/10 shrink-0">
        {error && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg mb-3">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300 text-xs break-words w-full">{error}</span>
          </div>
        )}

        {connected ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg justify-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-300 text-sm font-medium font-mono">{formatAddress(address)}</span>
            </div>
            <Button
              onClick={disconnect}
              variant="secondary"
              className="w-full justify-center"
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Disconnect</span>
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full justify-center" size="sm">
            <Link href="/login">
              {connecting ? (
                <>
                  <span className="loading-spinner-sm mr-2" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Connect Wallet</span>
                </>
              )}
            </Link>
          </Button>
        )}
      </div>
      <style jsx>{`
        .nav-link-active {
          @apply text-white px-3 py-2 rounded-lg text-sm font-medium bg-teal-400/10 border border-teal-300/20 transition-all duration-300;
        }
      `}</style>
    </aside>
  )
}
