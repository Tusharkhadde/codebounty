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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/20 bg-teal-300/10 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  <ShieldCheck className="h-5 w-5 text-teal-300" />
                </div>
              </div>

              {/* Fast OAuth Buttons */}
              <div className="mt-8 space-y-6">
                <a
                  href="/api/auth/github"
                  className="btn-primary w-full py-3.5 text-sm justify-center font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transition-all duration-300 group"
                >
                  <Github className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" /> Quick Sign Up with GitHub
                </a>

                <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your CodeBounty profile will be automatically created using your GitHub username. You can connect your Stellar wallet from your dashboard later.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
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
              </div>
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
