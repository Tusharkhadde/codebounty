'use client'

import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { connected, connecting, error, disconnect, address } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatAddress = (addr: string | null): string => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav aria-label="Main navigation" className="bg-[#06080d]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 animate-fade-in-down">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="nav-link-active">
              Dashboard
            </Link>
            <Link href="/bounties" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5">
              Bounties
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5">
              About
            </Link>
            <Link href="/profile" className="text-gray-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5">
              Profile
            </Link>
            <Link href="/login" className="text-teal-300 hover:text-teal-100 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-teal-400/10">
              Sign In
            </Link>
            <Link href="/signup" className="text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-300/30 hover:bg-teal-400/30 transition-all ml-1">
              Sign Up
            </Link>
          </div>

          {/* Wallet Connection & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Error Display — desktop */}
            {error && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg max-w-[220px]">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-300 text-xs truncate">{error}</span>
              </div>
            )}

            {/* Wallet Connection */}
            {connected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-green-300 text-sm font-medium font-mono">{formatAddress(address)}</span>
                </div>
                <Button
                  onClick={disconnect}
                  variant="secondary"
                  size="sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">
                  {connecting ? (
                    <>
                      <span className="loading-spinner-sm" />
                      <span className="hidden sm:inline">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="hidden sm:inline">Connect Wallet</span>
                    </>
                  )}
                </Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/[.08] transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 pt-4 pb-3 animate-fade-in-down">
            <div className="flex flex-col gap-2">
              <Link 
                href="/" 
                className="text-white px-3 py-2.5 rounded-lg text-sm font-medium bg-teal-400/10 border border-teal-300/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/bounties" 
                className="text-gray-400 hover:text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bounties
              </Link>
              <Link 
                href="/about" 
                className="text-gray-400 hover:text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/profile" 
                className="text-gray-400 hover:text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              
              {/* Mobile Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-300 text-sm leading-tight">{error}</span>
                </div>
              )}

              {/* Mobile Wallet Info */}
              {connected && (
                <div className="flex items-center gap-2 px-3 py-2.5 mt-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-green-300 text-sm font-mono">{formatAddress(address)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Style for Active Nav Link */}
      <style jsx>{`
        .nav-link-active {
          @apply text-white px-3 py-2 rounded-lg text-sm font-medium bg-teal-400/10 border border-teal-300/20 transition-all duration-300;
        }
      `}</style>
    </nav>
  )
}
