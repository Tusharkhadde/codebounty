'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Github, ShieldCheck, ArrowRight, Wallet, CheckCircle2, AlertCircle, Sparkles, Key, Lock } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

function LoginContent() {
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const errorParam = searchParams?.get('error')

  useEffect(() => {
    if (errorParam === 'github-not-configured') {
      setErrorMsg('GitHub OAuth is not configured on this environment.')
    } else if (errorParam === 'invalid-state' || errorParam === 'github-auth-failed') {
      setErrorMsg('GitHub authentication failed or expired. Please try again.')
    }
  }, [errorParam])

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-4xl items-center py-8">
      <div className="grid w-full gap-8 md:grid-cols-12 items-stretch">
        
        {/* Left Side: Brand Value Props */}
        <div className="glass-card flex flex-col justify-between p-8 md:col-span-5 md:p-10 border-teal-500/20 bg-gradient-to-b from-teal-500/10 via-surface/60 to-surface">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3.5 py-1.5 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5" /> Web3 Escrow Auth
            </div>

            <h1 className="heading-md mt-6 font-bold tracking-tight text-white">
              Welcome to <span className="text-teal-400">CodeBounty</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              The decentralized bug bounty platform powered by Soroban smart contracts on Stellar.
            </p>

            <div className="mt-8 space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400 mt-0.5" />
                <span>Link GitHub PRs & issues directly to automated crypto payouts</span>
              </div>  
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400 mt-0.5" />
                <span>Non-custodial wallet signatures for instant escrow funding</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400 mt-0.5" />
                <span>Verifiable multi-network payout address management</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Need an account?</span>
            <Link href="/signup" className="font-medium text-teal-300 hover:text-teal-200 flex items-center gap-1">
              Sign Up <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Right Side: Auth Methods Container */}
        <div className="glass-card flex flex-col justify-center p-8 md:col-span-7 md:p-10 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
          
          <div className="relative z-10 w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10 mb-6 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <Github className="h-7 w-7 text-teal-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-sm text-slate-400">Authenticate securely via your GitHub developer account.</p>
            </div>

            {/* Error banner if present */}
            {errorMsg && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            <div className="space-y-6">
              <a
                href="/api/auth/github"
                className="btn-primary w-full py-3.5 text-sm justify-center font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all duration-300 group"
              >
                <Github className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" /> 
                Continue with GitHub
              </a>
              
              <p className="text-[11px] text-slate-500 text-center px-4 leading-relaxed">
                By signing in, you authorize CodeBounty to verify repository ownership and pull request submissions for smart contract escrow payouts.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center text-center">
        <div className="space-y-4">
          <div className="loading-spinner-lg mx-auto" />
          <p className="text-sm text-slate-400">Loading auth portal...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
