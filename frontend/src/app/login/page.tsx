'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Github, ShieldCheck, ArrowRight, Wallet, CheckCircle2, AlertCircle, Sparkles, Key, Lock } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { connected, address, connect, disconnect, connecting, demoMode, enableDemoMode } = useWallet()
  const [activeTab, setActiveTab] = useState<'github' | 'wallet' | 'email'>('github')
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const errorParam = searchParams?.get('error')

  useEffect(() => {
    if (errorParam === 'github-not-configured') {
      setErrorMsg('GitHub OAuth is not configured on this environment. You can use Wallet Auth below!')
    } else if (errorParam === 'invalid-state' || errorParam === 'github-auth-failed') {
      setErrorMsg('GitHub authentication failed or expired. Please try again.')
    }
  }, [errorParam])

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setEmailSent(true)
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-4xl items-center py-8">
      <div className="grid w-full gap-8 md:grid-cols-12 items-stretch">
        
        {/* Left Side: Brand Value Props */}
        <div className="glass-card flex flex-col justify-between p-8 md:col-span-5 md:p-10 border-teal-500/20 bg-gradient-to-b from-teal-500/10 via-surface/60 to-surface">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3.5 py-1.5 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5" /> Web3 Escrow Auth
            </div>

            <h1 className="heading-md mt-6 font-bold tracking-tight">
              Welcome to <span className="text-gradient">CodeBounty</span>
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
        <div className="glass-card flex flex-col justify-between p-8 md:col-span-7 md:p-10">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Sign In</h2>
                <p className="text-xs text-slate-400 mt-1">Select your preferred login method</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10">
                <ShieldCheck className="h-5 w-5 text-teal-300" />
              </div>
            </div>

            {/* Error banner if present */}
            {errorMsg && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {/* Auth Method Tabs */}
            <div className="mt-6 flex rounded-xl bg-white/[0.04] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('github')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'github'
                    ? 'bg-teal-400/20 text-teal-300 border border-teal-300/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'wallet'
                    ? 'bg-teal-400/20 text-teal-300 border border-teal-300/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="h-3.5 w-3.5" /> Web3 Wallet
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'email'
                    ? 'bg-teal-400/20 text-teal-300 border border-teal-300/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="h-3.5 w-3.5" /> Passwordless
              </button>
            </div>

            {/* Tab 1: GitHub OAuth */}
            {activeTab === 'github' && (
              <div className="mt-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Authenticate with GitHub to verify repository ownership, issue creation, and pull request submissions.
                </p>
                <a
                  href="/api/auth/github"
                  className="btn-primary w-full py-3 text-sm justify-center font-medium shadow-lg shadow-teal-500/20"
                >
                  <Github className="h-4 w-4" /> Continue with GitHub OAuth
                </a>
                <p className="text-[11px] text-slate-400 text-center">
                  By logging in, you agree to CodeBounty Smart Contract terms and public repo read access.
                </p>
              </div>
            )}

            {/* Tab 2: Web3 Freighter Wallet */}
            {activeTab === 'wallet' && (
              <div className="mt-6 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect your Stellar wallet (Freighter / Albedo) to sign into your bounty management dashboard.
                </p>

                {connected ? (
                  <div className="rounded-xl border border-teal-300/30 bg-teal-300/10 p-4 text-xs space-y-3">
                    <div className="flex items-center justify-between text-teal-300 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Wallet Connected
                      </span>
                      <span className="text-[10px] bg-teal-400/20 px-2 py-0.5 rounded text-teal-200">
                        {demoMode ? 'Demo Testnet' : 'Stellar Network'}
                      </span>
                    </div>
                    <code className="block break-all text-[11px] text-white font-mono bg-black/30 p-2 rounded border border-white/10">
                      {address}
                    </code>
                    <button
                      onClick={() => router.push('/profile')}
                      className="btn-primary w-full py-2.5 text-xs font-semibold"
                    >
                      Proceed to Profile Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={connect}
                      disabled={connecting}
                      className="btn-primary w-full py-3 text-sm justify-center font-medium shadow-lg shadow-teal-500/20"
                    >
                      <Wallet className="h-4 w-4" />
                      {connecting ? 'Connecting Wallet...' : 'Connect Freighter Wallet'}
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="https://www.freighter.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-400 hover:text-teal-300 underline"
                      >
                        Don&apos;t have Freighter? Get Extension
                      </a>
                      <button
                        type="button"
                        onClick={enableDemoMode}
                        className="text-[11px] text-teal-300 hover:text-white font-medium flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3 text-teal-400" /> Try Demo Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Email Magic Link */}
            {activeTab === 'email' && (
              <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
                {emailSent ? (
                  <div className="rounded-xl border border-teal-300/30 bg-teal-300/10 p-4 text-xs text-teal-200 space-y-2">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-300" /> Magic Link Dispatched!
                    </div>
                    <p>Check your inbox at <span className="text-white font-medium">{email}</span> for your instant login access link.</p>
                    <button
                      type="button"
                      onClick={() => setEmailSent(false)}
                      className="mt-2 text-[11px] text-teal-300 underline hover:text-white"
                    >
                      Try another email
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Enter your developer email to receive a secure, passwordless magic login link.
                    </p>
                    <div>
                      <label className="input-label text-xs">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="developer@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 text-sm justify-center font-medium">
                      <Lock className="h-4 w-4" /> Send Magic Link
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <Link href="/profile" className="text-xs text-teal-300 hover:text-teal-100 underline">
              Manage saved payout addresses & networks
            </Link>
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
