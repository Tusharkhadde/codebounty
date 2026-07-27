'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import type { CreateBountyFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ExternalLink, ShieldCheck, Sparkles, Github, DollarSign, Calendar, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GitHubIssueDetails {
  title: string
  body: string
  state: string
  repository: string
  issueNumber: number
  author: string
  avatarUrl: string
  labels: Array<{ name: string; color: string }>
}

export function CreateBountyForm() {
  const router = useRouter()
  const { connected, address, connect } = useWallet()
  const [githubUser, setGithubUser] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [formData, setFormData] = useState<CreateBountyFormData>({
    issueUrl: '',
    amount: '250',
    token: 'XLM',
    deadline: Math.floor(Date.now() / 1000 + 30 * 86400).toString(),
  })

  const [verifyingIssue, setVerifyingIssue] = useState(false)
  const [issueDetails, setIssueDetails] = useState<GitHubIssueDetails | null>(null)
  const [issueError, setIssueError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdBountyId, setCreatedBountyId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setGithubUser(data.user.login)
        }
      })
      .catch(() => {})
  }, [])

  const handleVerifyIssue = async (urlToVerify?: string) => {
    const url = urlToVerify || formData.issueUrl
    setIssueError(null)

    if (!url.trim()) {
      setIssueError('Please paste a GitHub issue URL')
      return false
    }

    if (!/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/issues\/\d+\/?$/.test(url.trim())) {
      setIssueError('Invalid format. URL must look like: https://github.com/owner/repo/issues/123')
      return false
    }

    setVerifyingIssue(true)
    try {
      const res = await fetch(`/api/github/issue?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch issue details')
      }

      setIssueDetails(data.issue)
      return true
    } catch (err: any) {
      setIssueError(err.message || 'Could not verify GitHub issue')
      setIssueDetails(null)
      return false
    } finally {
      setVerifyingIssue(false)
    }
  }

  const handleStep1Next = async (e: FormEvent) => {
    e.preventDefault()
    if (!issueDetails) {
      const ok = await handleVerifyIssue()
      if (!ok) return
    }
    setStep(2)
  }

  const handleStep2Next = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const amountNum = parseFloat(formData.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    setStep(3)
  }

  const handleCreateAndFund = async () => {
    setError(null)

    const creatorAddr = address
    if (!creatorAddr) {
      setError('Please connect your Freighter wallet before creating an escrow.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bounties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueUrl: formData.issueUrl,
          title: issueDetails?.title,
          repository: issueDetails?.repository,
          amount: formData.amount,
          token: formData.token,
          deadline: formData.deadline,
          creator: creatorAddr,
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create escrow bounty')
      }

      setCreatedBountyId(data.bounty.id)
    } catch (err: any) {
      setError(err?.message || 'Transaction failed')
    } finally {
      setSubmitting(false)
    }
  }

  const setPresetDeadlineDays = (days: number) => {
    const ts = Math.floor(Date.now() / 1000 + days * 86400).toString()
    setFormData(prev => ({ ...prev, deadline: ts }))
  }

  if (createdBountyId) {
    return (
      <Card className="p-8 md:p-10 border-teal-500/30 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/10">
          <CheckCircle2 className="w-10 h-10 text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Bounty Created & Funded!</h2>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
          Your bounty <span className="text-teal-300 font-semibold">#{createdBountyId}</span> is now active.
          {formData.amount} {formData.token} has been locked into the Soroban smart contract escrow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => router.push(`/bounties/${createdBountyId}`)}
            className="w-full sm:w-auto px-6 py-3"
          >
            View Bounty Details <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCreatedBountyId(null)
              setStep(1)
              setIssueDetails(null)
              setFormData({
                issueUrl: '',
                amount: '250',
                token: 'XLM',
                deadline: Math.floor(Date.now() / 1000 + 30 * 86400).toString(),
              })
            }}
            className="w-full sm:w-auto px-6 py-3 border-white/20 text-slate-300"
          >
            Create Another Bounty
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 md:p-8 border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-xl animate-fade-in-up">
      {/* Wizard Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border border-teal-400/30">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Soroban Bounty Escrow</h2>
              <p className="text-xs text-slate-400">Lock XLM/USDC in smart contract until GitHub PR merges</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
            Step {step} of 3
          </span>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-teal-400' : 'bg-white/10'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-teal-400' : 'bg-white/10'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-teal-400' : 'bg-white/10'}`} />
        </div>
      </div>

      {/* STEP 1: GITHUB ISSUE VALIDATION */}
      {step === 1 && (
        <form onSubmit={handleStep1Next} className="space-y-6 animate-fade-in">
          <div>
            <Label htmlFor="issueUrl" className="text-sm font-semibold text-slate-200 mb-2 block">
              GitHub Issue URL <span className="text-teal-400">*</span>
            </Label>
            <div className="relative">
              <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="issueUrl"
                type="text"
                value={formData.issueUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, issueUrl: e.target.value }))
                  setIssueError(null)
                }}
                placeholder="https://github.com/stellar/stellar-sdk/issues/1420"
                className="pl-10 text-xs md:text-sm py-3 bg-black/30 border-white/10 focus:border-teal-400"
                required
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-slate-400">Paste any open public GitHub issue link</p>
              <button
                type="button"
                onClick={() => handleVerifyIssue()}
                disabled={verifyingIssue || !formData.issueUrl.trim()}
                className="text-xs text-teal-300 hover:text-teal-200 disabled:opacity-50 font-medium underline flex items-center gap-1"
              >
                {verifyingIssue ? 'Verifying...' : 'Validate Issue'}
              </button>
            </div>
          </div>

          {issueError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{issueError}</span>
            </div>
          )}

          {/* Live Preview Card */}
          {issueDetails && (
            <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/[0.04] space-y-3 animate-fade-in-up">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono font-medium">
                  {issueDetails.repository} #{issueDetails.issueNumber}
                </span>
                <span className="text-slate-400">By @{issueDetails.author}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{issueDetails.title}</h4>
              {issueDetails.body && (
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {issueDetails.body}
                </p>
              )}
            </div>
          )}

          <Button type="submit" disabled={verifyingIssue} className="w-full py-3">
            Continue to Reward Setup <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      )}

      {/* STEP 2: REWARD & DEADLINE */}
      {step === 2 && (
        <form onSubmit={handleStep2Next} className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="amount" className="text-sm font-semibold text-slate-200 mb-2 block">
                Bounty Reward Amount <span className="text-teal-400">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="250"
                  className="pl-10 text-sm py-3 bg-black/30 border-white/10 focus:border-teal-400"
                  min="1"
                  step="any"
                  required
                />
              </div>
              <div className="flex gap-2 mt-2">
                {['100', '250', '500', '1000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: val }))}
                    className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:border-teal-400 hover:text-teal-300 transition-colors"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="token" className="text-sm font-semibold text-slate-200 mb-2 block">
                Escrow Token Asset
              </Label>
              <select
                id="token"
                value={formData.token}
                onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                className="w-full px-3.5 py-3 rounded-md bg-slate-900 border border-white/10 text-slate-200 text-sm focus:border-teal-400 outline-none"
              >
                <option value="XLM">XLM — Stellar Lumens (Native)</option>
                <option value="USDC">USDC — Circle USD Stablecoin</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="deadline" className="text-sm font-semibold text-slate-200 mb-2 block">
              Bounty Expiration Deadline
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="deadline"
                type="number"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                placeholder="Unix timestamp"
                className="pl-10 text-xs font-mono py-3 bg-black/30 border-white/10"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-[11px] text-slate-400 self-center">Presets:</span>
              <button
                type="button"
                onClick={() => setPresetDeadlineDays(7)}
                className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:border-teal-400"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetDeadlineDays(14)}
                className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:border-teal-400"
              >
                +14 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetDeadlineDays(30)}
                className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 hover:border-teal-400"
              >
                +30 Days
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="w-1/3 py-3 border-white/10 text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button type="submit" className="w-2/3 py-3">
              Review & Sign Escrow <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: WALLET & SIGNATURE */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Box */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escrow Summary</h4>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Target Issue</span>
              <a href={formData.issueUrl} target="_blank" rel="noreferrer" className="text-teal-300 hover:underline flex items-center gap-1 font-mono text-xs">
                {issueDetails?.repository || 'GitHub Issue'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Escrow Amount</span>
              <span className="text-white font-bold text-base">{formData.amount} {formData.token}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Network Fee</span>
              <span className="text-teal-300 text-xs font-mono">0.00001 XLM (Soroban Gas)</span>
            </div>
          </div>

          {/* Wallet Status Banner */}
          {!connected ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Wallet Authorization Required</span>
              </div>
              <p className="text-amber-200/80">Connect your Freighter Wallet to sign and deposit into escrow.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => connect()}
                  className="px-3 py-1.5 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 text-xs font-medium"
                >
                  Connect Freighter
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <div>
                  <div className="font-bold text-white">
                    Freighter Wallet Connected
                  </div>
                  <div className="font-mono text-[11px] text-teal-300/80 truncate max-w-[200px] sm:max-w-xs">
                    {address}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="w-1/3 py-3 border-white/10 text-slate-300"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              type="button"
              onClick={handleCreateAndFund}
              disabled={submitting || !connected}
              className="w-2/3 py-3"
            >
              {submitting ? 'Signing & Depositing...' : `Sign & Deposit ${formData.amount} ${formData.token}`}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
