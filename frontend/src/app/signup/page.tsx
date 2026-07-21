'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Github, ShieldCheck, ArrowRight, Wallet, CheckCircle2, User, Mail, Sparkles, Building, Code2 } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

export default function SignupPage() {
  const router = useRouter()
  const { connected, address, connect, connecting } = useWallet()

  const [role, setRole] = useState<'developer' | 'sponsor'>('developer')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    organization: '',
    bio: '',
    agreedToTerms: false
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreedToTerms) return
    // Persist registration preference locally
    const registration = { ...formData, role, registeredAt: new Date().toISOString() }
    window.localStorage.setItem('codebounty.user-registration', JSON.stringify(registration))
    setSubmitted(true)
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center py-8">
      <div className="grid w-full gap-8 md:grid-cols-12 items-stretch">

        {/* Left Banner: Role & Value Proposition */}
        <div className="glass-card flex flex-col justify-between p-8 md:col-span-5 md:p-10 border-teal-500/20 bg-gradient-to-b from-teal-500/10 via-surface/60 to-surface">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3.5 py-1.5 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5" /> Join CodeBounty Network
            </div>

            <h1 className="heading-md mt-6 font-bold tracking-tight">
              Create your <span className="text-gradient">Developer Identity</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Whether you are hunting bug bounties or sponsoring open-source issues, get onboarded in seconds.
            </p>

            {/* Role selector summary */}
            <div className="mt-8 space-y-3">
              <div
                onClick={() => setRole('developer')}
                className={`cursor-pointer rounded-xl border p-3.5 text-xs transition-all ${
                  role === 'developer'
                    ? 'border-teal-400 bg-teal-400/10 text-white shadow-md'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2 text-sm text-teal-300">
                    <Code2 className="h-4 w-4" /> Hunter / Developer
                  </span>
                  {role === 'developer' && <CheckCircle2 className="h-4 w-4 text-teal-400" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-300 leading-tight">
                  Solve GitHub issues, link PRs, and receive automated payout transfers to your wallet.
                </p>
              </div>

              <div
                onClick={() => setRole('sponsor')}
                className={`cursor-pointer rounded-xl border p-3.5 text-xs transition-all ${
                  role === 'sponsor'
                    ? 'border-teal-400 bg-teal-400/10 text-white shadow-md'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2 text-sm text-teal-300">
                    <Building className="h-4 w-4" /> Sponsor / Project Lead
                  </span>
                  {role === 'sponsor' && <CheckCircle2 className="h-4 w-4 text-teal-400" />}
                </div>
                <p className="mt-1 text-[11px] text-slate-300 leading-tight">
                  Escrow funds into Stellar smart contracts and reward contributors seamlessly.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Already have an identity?</span>
            <Link href="/login" className="font-medium text-teal-300 hover:text-teal-200 flex items-center gap-1">
              Sign In <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Right Form: Registration Form & One-click Auth */}
        <div className="glass-card flex flex-col justify-between p-8 md:col-span-7 md:p-10">
          {submitted ? (
            <div className="my-auto text-center space-y-4 py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-400/20 text-teal-300 border border-teal-300/30 animate-pulse">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Account Created!</h2>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Your CodeBounty profile has been initialized as a <span className="text-teal-300 font-semibold uppercase">{role}</span>. Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Sign Up</h2>
                  <p className="text-xs text-slate-400 mt-1">Quick onboarding for Web3 contributors</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10">
                  <ShieldCheck className="h-5 w-5 text-teal-300" />
                </div>
              </div>

              {/* Fast OAuth Buttons */}
              <div className="mt-6 space-y-3">
                <a
                  href="/api/auth/github"
                  className="btn-primary w-full py-2.5 text-xs justify-center font-medium shadow-md"
                >
                  <Github className="h-4 w-4" /> Quick Sign Up with GitHub
                </a>

                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <span className="relative bg-surface-raised px-3 text-[10px] uppercase font-semibold text-slate-400">or complete profile details</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="input-label text-xs">GitHub / Handle Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. dev_hunter"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input-field text-xs pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label text-xs">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="developer@stellar.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field text-xs pl-10"
                    />
                  </div>
                </div>

                {role === 'sponsor' && (
                  <div>
                    <label className="input-label text-xs">Organization / Project Name</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Stellar Foundation / OpenLab"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="input-field text-xs pl-10"
                      />
                    </div>
                  </div>
                )}

                {/* Freighter Connection Shortcut */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>Web3 Wallet Connection</span>
                    {connected ? (
                      <span className="text-[10px] text-teal-300 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={connect}
                        disabled={connecting}
                        className="text-[11px] text-teal-300 hover:underline flex items-center gap-1"
                      >
                        <Wallet className="h-3 w-3" /> {connecting ? 'Connecting...' : 'Connect Freighter'}
                      </button>
                    )}
                  </div>
                  {connected && (
                    <code className="block break-all text-[10px] text-slate-400 font-mono bg-black/30 p-1.5 rounded">
                      {address}
                    </code>
                  )}
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-0.5 rounded border-white/20 bg-surface-raised accent-teal-400"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight">
                    I agree to the <span className="text-teal-300 underline cursor-pointer">CodeBounty Terms</span> and acknowledge smart contract escrow rules.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!formData.agreedToTerms}
                  className="btn-primary w-full py-3 text-sm justify-center font-medium mt-2 shadow-lg shadow-teal-500/20"
                >
                  Create Account
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            Already registered? <Link href="/login" className="text-teal-300 hover:underline">Log in here</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
