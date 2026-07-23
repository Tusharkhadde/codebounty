'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const pathname = usePathname()
  const { connected, connecting, error, disconnect, address, connect, enableDemoMode, demoMode, clearError } = useWallet()

  const formatAddress = (addr: string | null): string => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isActive = (path: string) => pathname === path

  return (
    <aside aria-label="Main navigation" className="bg-[#06080d]/90 backdrop-blur-xl border-r border-white/10 sticky top-0 h-screen w-64 flex-shrink-0 flex flex-col z-50">
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
        <Link 
          href="/" 
          className={isActive('/') ? "nav-link-active w-full block" : "nav-link-inactive w-full block"}
        >
          Dashboard
        </Link>
        <Link 
          href="/bounties" 
          className={isActive('/bounties') ? "nav-link-active w-full block" : "nav-link-inactive w-full block"}
        >
          Bounties
        </Link>
        <Link 
          href="/bounties/create" 
          className="text-teal-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-teal-500/10 border border-teal-500/20 block w-full"
        >
          + Create Bounty
        </Link>
        <Link 
          href="/about" 
          className={isActive('/about') ? "nav-link-active w-full block" : "nav-link-inactive w-full block"}
        >
          About
        </Link>
        <Link 
          href="/profile" 
          className={isActive('/profile') ? "nav-link-active w-full block" : "nav-link-inactive w-full block"}
        >
          Profile
        </Link>
      </div>

      {/* Footer / Wallet Connection */}
      <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
        {error && (
          <div className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg mb-3 relative">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-300 text-[11px] leading-tight break-words pr-4">{error}</span>
            <button onClick={clearError} className="absolute right-2 top-2 text-red-400 hover:text-red-300 p-0.5 rounded-md hover:bg-red-500/20 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {connected ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-lg justify-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-teal-300 text-xs font-medium font-mono">
                {demoMode ? 'Demo Mode' : formatAddress(address)}
              </span>
            </div>
            <Button
              onClick={disconnect}
              variant="secondary"
              className="w-full justify-center text-xs py-1.5"
              size="sm"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Disconnect</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => connect()} 
              disabled={connecting} 
              className="w-full justify-center py-2.5 text-xs font-bold shadow-lg shadow-teal-500/20" 
              size="sm"
            >
              {connecting ? (
                <>
                  <span className="loading-spinner-sm mr-2" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Connect Wallet</span>
                </>
              )}
            </Button>

            <button
              onClick={() => enableDemoMode()}
              className="text-[11px] text-slate-400 hover:text-teal-300 text-center transition-colors underline"
            >
              Or try Testnet Demo Mode
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .nav-link-active {
          @apply text-teal-300 px-3 py-2 rounded-lg text-sm font-semibold bg-teal-400/10 border border-teal-300/20 transition-all duration-300;
        }
        .nav-link-inactive {
          @apply text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5;
        }
      `}</style>
    </aside>
  )
}
