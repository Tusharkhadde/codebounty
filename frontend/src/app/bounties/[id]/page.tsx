'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Bounty } from '@/types'
import { BountyStepper } from '@/components/BountyStepper'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  ExternalLink,
  Github,
  ShieldCheck,
  CheckCircle2,
  GitPullRequest,
  Clock,
  Coins,
  AlertCircle,
  Copy,
  Check,
  Send
} from 'lucide-react'

export default function BountyDetailsPage() {
  const params = useParams()
  const bountyId = params.id as string
  const { connected, address } = useWallet()

  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // PR Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [prUrl, setPrUrl] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchBounty = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/bounties/${bountyId}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Bounty not found')
      }

      setBounty(data.bounty)
    } catch (err: any) {
      setError(err?.message || 'Failed to load bounty')
    } finally {
      setLoading(false)
    }
  }, [bountyId])

  useEffect(() => {
    if (bountyId) {
      fetchBounty()
    }
  }, [bountyId, fetchBounty])

  const handleLinkPR = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinkError(null)

    if (!prUrl.trim() || !/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+\/?$/.test(prUrl.trim())) {
      setLinkError('Please enter a valid GitHub Pull Request URL (e.g. https://github.com/owner/repo/pull/42)')
      return
    }

    setLinking(true)
    try {
      const res = await fetch(`/api/bounties/${bountyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link_pr',
          prUrl: prUrl.trim(),
          contributor: address || 'GAPK4U290ZX812903810293810293810293810293'
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to link pull request')
      }

      setBounty(data.bounty)
      setShowLinkModal(false)
      setPrUrl('')
    } catch (err: any) {
      setLinkError(err?.message || 'Failed to link pull request')
    } finally {
      setLinking(false)
    }
  }

  const handleSimulatePayout = async () => {
    try {
      const res = await fetch(`/api/bounties/${bountyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay' })
      })

      const data = await res.json()
      if (data.success) {
        setBounty(data.bounty)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="container-main py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading bounty details from Soroban registry...</p>
      </div>
    )
  }

  if (error || !bounty) {
    return (
      <div className="container-main py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Bounty Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'The requested bounty does not exist or has been removed.'}</p>
        <Link href="/bounties">
          <Button variant="outline" className="border-white/10 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Bounties
          </Button>
        </Link>
      </div>
    )
  }

  const isExpired = Date.now() / 1000 > bounty.deadline

  return (
    <div className="container-main py-10 space-y-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="space-y-4">
        <Link
          href="/bounties"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bounties
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-xs font-semibold">
                Bounty #{bounty.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {bounty.issue_url.replace('https://github.com/', '')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-snug">
              {bounty.issue_url.replace('https://github.com/', '')}
            </h1>
          </div>

          {/* Reward Badge */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-400/30 flex items-center gap-3 shrink-0 shadow-lg shadow-teal-500/10">
            <Coins className="w-8 h-8 text-teal-300" />
            <div>
              <div className="text-[11px] text-teal-200/80 font-medium uppercase tracking-wider">Escrow Reward</div>
              <div className="text-2xl font-black text-white">
                {bounty.amount.toLocaleString()} <span className="text-teal-300 text-lg">{bounty.token || 'XLM'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bounty Stepper Component */}
      <Card className="p-6 border-white/10 bg-white/[0.02]">
        <BountyStepper currentStep={bounty.status as any} bountyId={bounty.id} />
      </Card>

      {/* Main Grid: Details + Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Issue & Escrow Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* GitHub Issue Link Box */}
          <Card className="p-6 border-white/10 bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Github className="w-4 h-4 text-teal-300" /> Linked GitHub Issue
              </h3>
              <a
                href={bounty.issue_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-300 hover:underline flex items-center gap-1 font-medium"
              >
                View on GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="text-xs font-mono text-slate-400">{bounty.issue_url}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Contributors must solve this GitHub issue and open a Pull Request mentioning the issue number or bounty ID to claim the escrow.
              </p>
            </div>
          </Card>

          {/* Linked PR Section if PR exists */}
          {bounty.linked_pr_url && (
            <Card className="p-6 border-cyan-500/30 bg-cyan-500/[0.03] space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4" /> Submitted Pull Request
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-mono">
                  Pending Verification
                </span>
              </div>
              <a
                href={bounty.linked_pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-black/40 border border-cyan-500/20 text-xs font-mono text-cyan-300 hover:underline flex items-center justify-between"
              >
                <span className="truncate">{bounty.linked_pr_url}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
              </a>
              {bounty.status === 'linked' && (
                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={handleSimulatePayout}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold"
                  >
                    Simulate PR Merge & Payout <Send className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Paid Out Banner */}
          {bounty.status === 'paid' && (
            <Card className="p-6 border-teal-500/40 bg-teal-500/[0.05] space-y-3 animate-fade-in">
              <div className="flex items-center gap-3 text-teal-300">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">Escrow Payment Released</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The pull request was verified as merged. {bounty.amount} {bounty.token || 'XLM'} has been transferred to the contributor&apos;s wallet.
              </p>
            </Card>
          )}
        </div>

        {/* Right Col: Escrow Actions & Details */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="p-6 border-white/10 bg-white/[0.02] space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-300" /> Bounty Actions
            </h3>

            {bounty.status === 'funded' && (
              <Button
                onClick={() => setShowLinkModal(true)}
                className="w-full py-3 text-xs"
              >
                <GitPullRequest className="w-4 h-4 ml-1" /> Submit PR Solution
              </Button>
            )}

            {bounty.status === 'linked' && (
              <p className="text-xs text-slate-400 text-center">
                A solution PR has been linked! Payout triggers automatically when merged on GitHub.
              </p>
            )}

            {bounty.status === 'paid' && (
              <div className="p-3 rounded-lg bg-teal-500/10 text-teal-300 text-xs text-center font-semibold">
                Completed & Paid
              </div>
            )}
          </Card>

          {/* Escrow Details */}
          <Card className="p-6 border-white/10 bg-white/[0.02] space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escrow Specs</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Deadline
                </span>
                <span className={`font-mono ${isExpired ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                  {new Date(bounty.deadline * 1000).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Creator</span>
                <span className="font-mono text-slate-300 truncate max-w-[130px]">
                  {bounty.creator}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* PR Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 border-teal-500/30 bg-slate-950 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-teal-300" /> Link Solution PR
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkPR} className="space-y-4">
              <div>
                <Label htmlFor="prUrl" className="text-xs font-semibold text-slate-200 mb-1 block">
                  GitHub Pull Request URL
                </Label>
                <Input
                  id="prUrl"
                  type="text"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo/pull/42"
                  className="text-xs py-2.5 bg-black/40 border-white/10"
                  required
                />
              </div>

              {linkError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{linkError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLinkModal(false)}
                  className="border-white/10 text-slate-300 text-xs py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={linking}
                  className="text-xs py-2"
                >
                  {linking ? 'Linking...' : 'Link PR to Escrow'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
