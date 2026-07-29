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
  const [githubUser, setGithubUser] = useState<string | null>(null)
  const [pullRequests, setPullRequests] = useState<Array<{ number: number; title: string; state: string; htmlUrl: string; apiUrl: string; author: string }>>([])
  const [prsLoading, setPrsLoading] = useState(false)
  const [prsError, setPrsError] = useState<string | null>(null)

  // PR Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [prUrl, setPrUrl] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [simulateError, setSimulateError] = useState<string | null>(null)
  const [mergeCheckError, setMergeCheckError] = useState<string | null>(null)
  const [prMerged, setPrMerged] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)

  const fetchBounty = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/bounties/${bountyId}`)
      const data = await res.json()

      if (res.ok && data.success && data.bounty) {
        setBounty(data.bounty)
        return
      }

      throw new Error(data?.error || 'Bounty not found')
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

  useEffect(() => {
    const fetchGithubUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) return
        const data = await res.json()
        if (data?.authenticated && data?.user?.login) {
          setGithubUser(data.user.login)
        }
      } catch {
        setGithubUser(null)
      }
    }

    fetchGithubUser()
  }, [])

  useEffect(() => {
    const fetchPullRequests = async () => {
      if (!bounty?.issue_url) {
        setPullRequests([])
        return
      }

      setPrsError(null)
      setPrsLoading(true)
      try {
        const res = await fetch(
          `/api/github/pull-requests?issueUrl=${encodeURIComponent(bounty.issue_url)}`
        )
        const data = await res.json()
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to load matching pull requests')
        }
        setPullRequests(data.pullRequests || [])
      } catch (err: any) {
        setPrsError(err?.message || 'Unable to load pull requests')
      } finally {
        setPrsLoading(false)
      }
    }

    fetchPullRequests()
  }, [bounty?.issue_url])

  const handleLinkPR = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinkError(null)

    if (!address) {
      setLinkError('Connect your wallet before linking a PR so the contributor payout address can be recorded.')
      return
    }

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
          contributor: address
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

  const isOwner = !!(
    bounty?.owner_github_login &&
    githubUser &&
    bounty.owner_github_login.toLowerCase() === githubUser.toLowerCase()
  )

  const isContributor = !!(
    bounty?.contributor &&
    address &&
    bounty.contributor.toLowerCase() === address.toLowerCase()
  )

  const handleCancelBounty = async () => {
    if (!confirm('Are you sure you want to cancel this bounty and refund the escrow funds back to your wallet?')) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/bounties/${bountyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel bounty')
      }
      fetchBounty()
    } catch (err: any) {
      alert(err.message || 'Error cancelling bounty')
    } finally {
      setCancelling(false)
    }
  }

  const handleDeleteBounty = async () => {
    if (!confirm('Permanently delete this test bounty?')) return
    try {
      await fetch(`/api/bounties/${bountyId}`, { method: 'DELETE' })
      window.location.href = '/bounties'
    } catch (e) {}
  }

  useEffect(() => {
    const linkedPrUrl = bounty?.linked_pr_url
    if (!linkedPrUrl || bounty.status !== 'linked') return

    let cancelled = false

    const verifyMergeStatus = async () => {
      try {
        const res = await fetch(
          `/api/github/pull-request?url=${encodeURIComponent(linkedPrUrl)}`,
          { cache: 'no-store' }
        )
        const data = await res.json()

        if (cancelled) return

        if (!res.ok || !data.success) {
          setMergeCheckError(data?.error || 'Unable to verify PR merge status right now.')
          return
        }

        setMergeCheckError(null)

        if (data.pullRequest?.merged) {
          setPrMerged(true)
          if (isOwner || isContributor) {
            setShowClaimModal(true)
          }
        }

        return
      } catch (err: any) {
        setMergeCheckError(err?.message || 'Failed to verify linked pull request merge status.')
        console.error('Failed to verify linked pull request merge status:', err)
      }
    }

    verifyMergeStatus()
    const intervalId = window.setInterval(verifyMergeStatus, 30000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [bounty?.linked_pr_url, bounty?.status, bountyId, isOwner])

  const handleSimulatePayout = async () => {
    setSimulateError(null)
    setSimulating(true)

    try {
      if (!bounty?.linked_pr_url) {
        throw new Error('No linked pull request is available for verification.')
      }

      const res = await fetch(
        `/api/github/pull-request?url=${encodeURIComponent(bounty.linked_pr_url)}`,
        { cache: 'no-store' }
      )
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify pull request status.')
      }

      if (!data.pullRequest?.merged) {
        throw new Error('The linked pull request is not merged yet.')
      }

      setPrMerged(true)
      if (isOwner || isContributor) {
        setShowClaimModal(true)
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to verify pull request merge.'
      setSimulateError(message)
      console.error(message)
    } finally {
      setSimulating(false)
    }
  }

  const handleReleasePayment = async () => {
    if (!bounty?.contributor) {
      alert('No contributor wallet address is available for payout.')
      return
    }

    if (!address && !isOwner) {
      alert('Connect your wallet to claim the bounty.')
      return
    }

    const action = isOwner ? 'pay' : 'claim'
    const walletAddress = isOwner ? bounty.contributor : address

    try {
      const res = await fetch(`/api/bounties/${bountyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, walletAddress })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to release payment')
      }
      setBounty(data.bounty)
      setShowClaimModal(false)
    } catch (err: any) {
      alert(err?.message || 'Failed to release payment. Please try again.')
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
              {bounty.contributor && (
                <div className="mt-2 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-xs text-slate-300">
                  <div className="font-medium text-teal-200">Contributor wallet detected</div>
                  <div className="mt-1 font-mono break-all text-slate-300">{bounty.contributor}</div>
                </div>
              )}

              {bounty.status === 'linked' && (
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-200">Merge status</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono ${prMerged ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700 text-slate-300'}`}>
                      {prMerged ? 'Merged' : 'Pending Merge'}
                    </span>
                  </div>
                  {mergeCheckError && (
                    <p className="text-xs text-rose-300">{mergeCheckError}</p>
                  )}
                  {isOwner ? (
                    <div className="flex flex-col gap-2 sm:flex-row justify-end">
                      <Button
                        onClick={handleSimulatePayout}
                        size="sm"
                        disabled={simulating}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold"
                      >
                        {simulating ? 'Checking…' : 'Verify PR Merge'}
                        <Send className="w-3.5 h-3.5 ml-1" />
                      </Button>
                      <Button
                        onClick={() => setShowClaimModal(true)}
                        size="sm"
                        disabled={!prMerged}
                        className="bg-teal-500 hover:bg-teal-400 disabled:bg-slate-600 text-black text-xs font-bold"
                      >
                        {prMerged ? 'Release Payment' : 'Waiting for merge'}
                      </Button>
                    </div>
                  ) : isContributor ? (
                    <div className="flex flex-col gap-2 sm:flex-row justify-end">
                      <Button
                        onClick={() => setShowClaimModal(true)}
                        size="sm"
                        disabled={!prMerged}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-black text-xs font-bold"
                      >
                        {prMerged ? 'Claim Reward' : 'Waiting for merge'}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Only the bounty owner or the recorded contributor can act here. Once the linked PR is merged, the owner can release payment or the contributor can claim it.
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}

          <Card className="p-6 border-white/10 bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-4 h-4" /> Pull Requests referencing this issue
              </h3>
              <span className="text-xs text-slate-400">
                {prsLoading ? 'Loading…' : `${pullRequests.length} found`}
              </span>
            </div>

              {prsError && (
                <p className="text-xs text-rose-300">{prsError}</p>
              )}

              {!prsLoading && pullRequests.length === 0 && !prsError && (
                <p className="text-xs text-slate-400">No pull requests found that reference this issue yet.</p>
              )}

              <div className="space-y-3">
                {pullRequests.map((pr) => (
                  <a
                    key={pr.number}
                    href={pr.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-slate-200 hover:border-teal-500/30 hover:bg-slate-900 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-100 truncate">#{pr.number} {pr.title}</span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{pr.state}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{pr.author}</span>
                      <span>{pr.htmlUrl.replace('https://github.com/', '')}</span>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-white/10 bg-white/[0.02] space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-300" /> Bounty Actions
            </h3>

            {bounty.status === 'funded' ? (
              <>
                <Button
                  onClick={() => setShowLinkModal(true)}
                  disabled={isOwner || linking}
                  className="w-full py-3 text-xs"
                >
                  <GitPullRequest className="w-4 h-4 ml-1" />
                  {isOwner ? 'Bounty creators cannot submit PRs' : 'Submit PR Solution'}
                </Button>
                {isOwner ? (
                  <p className="text-xs text-slate-400">
                    You created this bounty, so you cannot submit the PR. Please let another contributor apply.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Link your GitHub PR here once you have opened it against the issue.
                  </p>
                )}
              </>
            ) : bounty.status === 'linked' ? (
              <>
                <p className="text-xs text-slate-400">
                  A solution PR has been linked! Payout triggers automatically when merged on GitHub.
                </p>
                {isOwner && prMerged && (
                  <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-teal-100">
                    <p className="font-semibold text-teal-200">Pull request merge detected.</p>
                    <p className="text-slate-300 text-xs">
                      Since you created this bounty, your wallet is automatically recognized and you can claim the escrow payout directly from the platform.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => setShowClaimModal(true)}
                        className="w-full py-2 text-xs bg-teal-500 hover:bg-teal-400 text-black"
                      >
                        Claim Payout to Wallet
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400">
                This bounty is not currently available for PR submission.
              </p>
            )}

            {bounty.status !== 'cancelled' && bounty.status !== 'paid' && (
              <Button
                onClick={handleCancelBounty}
                disabled={cancelling}
                variant="outline"
                className="w-full py-2.5 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Bounty & Refund Escrow'}
              </Button>
            )}

            {bounty.status === 'cancelled' && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center font-semibold">
                Bounty Cancelled & Funds Refunded
              </div>
            )}

            <Button
              onClick={handleDeleteBounty}
              variant="ghost"
              className="w-full text-xs text-slate-500 hover:text-rose-400 py-1"
            >
              Delete Test Bounty
            </Button>
          </Card>

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

      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-5 border-emerald-500/30 bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Release Payment to Contributor</h3>
                <p className="text-sm text-slate-400">
                  The linked pull request has merged. Release the escrowed reward directly to the contributor&apos;s recorded Stellar wallet address.
                </p>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-slate-100">
              <p className="font-semibold text-teal-200">Contributor wallet</p>
              <p className="mt-1 font-mono text-xs text-slate-300 break-all">
                {bounty.contributor || 'No contributor wallet found'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleReleasePayment}
                disabled={!bounty.contributor || (!isOwner && !isContributor)}
                className="w-full py-3 text-xs bg-emerald-500 hover:bg-emerald-400 text-black disabled:cursor-not-allowed disabled:bg-emerald-600/40"
              >
                {isOwner ? 'Release Reward to Contributor' : 'Claim Reward to My Wallet'}
              </Button>
              <Button
                variant="outline"
                className="w-full py-3 text-xs border-white/20 text-slate-300"
                onClick={() => setShowClaimModal(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
