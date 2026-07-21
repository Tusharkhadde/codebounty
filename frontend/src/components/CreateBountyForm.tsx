'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import type { CreateBountyFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateBountyForm() {
  const { connected, connecting } = useWallet()
  const [githubUser, setGithubUser] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateBountyFormData>({
    issueUrl: '',
    amount: '',
    token: 'XLM',
    deadline: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setGithubUser(data.user.login)
        }
      })
      .catch(console.error)
  }, [])

  const validateForm = (): boolean => {
    if (!formData.issueUrl.trim()) {
      setError('GitHub issue URL is required')
      return false
    }
    if (!/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/issues\/\d+$/.test(formData.issueUrl)) {
      setError('Invalid GitHub issue URL format')
      return false
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0')
      return false
    }
    if (!formData.deadline) {
      setError('Deadline is required')
      return false
    }
    return true
  }

  const resetForm = () => {
    setFormData({
      issueUrl: '',
      amount: '',
      token: 'XLM',
      deadline: '',
    })
    setSuccess(false)
    setError(null)
  }

  const getCurrentTimestamp = (): string => {
    return Math.floor(Date.now() / 1000).toString()
  }

  const getRecommendedDeadline = (): string => {
    const recommended = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days from now
    return recommended.toString()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!connected) {
      setError('Please connect your wallet first')
      return
    }

    if (!githubUser) {
      setError('Please sign in with GitHub first')
      return
    }

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const registryAddress = process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_ADDRESS
      if (!registryAddress) {
        throw new Error('BountyRegistry is not configured. Add NEXT_PUBLIC_BOUNTY_REGISTRY_ADDRESS before submitting.')
      }
      throw new Error('Soroban transaction signing is not available in this build yet.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bounty')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: keyof CreateBountyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  if (!connected || !githubUser) {
    return (
      <Card className="text-center py-12 px-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
          <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect to Create Bounty</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
          You need to sign in with GitHub and connect your Stellar wallet to create bounties.
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {!githubUser && (
            <a href="/login" className="btn-primary w-full py-2.5 justify-center">
              Sign In with GitHub
            </a>
          )}
          {!connected && (
            <button className="btn-secondary w-full py-2.5 justify-center pointer-events-none opacity-50">
              Wallet Required
            </button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Create New Bounty</h2>
          <p className="text-sm text-gray-400">Fund a GitHub issue through a smart-contract escrow</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl flex items-center gap-3 animate-fade-in-up">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Bounty Created Successfully!</p>
            <p className="text-gray-400 text-xs">Your bounty is now live and ready for contributors.</p>
          </div>
        </div>
      )}

      {/* Stake Pool Info */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">About Stakes</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          You approve one deposit from your wallet. Funds are held by the Soroban contract—not an AI agent—and can only be released after the linked pull request is independently verified as merged.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl flex items-center gap-3 animate-fade-in-up">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* GitHub Connection Alert */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-yellow-200 font-medium">GitHub issue verification required</p>
            <p className="text-xs text-yellow-300/80 mt-1">The issue URL is recorded with the bounty. A relay verifies the linked pull request merge before the escrow can pay out.</p>
          </div>
        </div>

        {/* Issue URL */}
        <div>
          <Label htmlFor="issueUrl">
            GitHub Issue URL
          </Label>
          <div className="relative group mt-1.5">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-teal-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </span>
            <Input
              id="issueUrl"
              type="text"
              value={formData.issueUrl}
              onChange={(e) => handleChange('issueUrl', e.target.value)}
              placeholder="https://github.com/owner/repo/issues/123"
              className="pl-10"
              required
            />
          </div>
          <p className="input-helper">Paste the URL of the GitHub issue you want to bounty</p>
        </div>

        {/* Amount & Token */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">
              Bounty Amount
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ✦
              </span>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="100"
                className="pl-10"
                min="0"
                step="0.0000001"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="token">
              Token
            </Label>
            <select
              id="token"
              value={formData.token}
              onChange={(e) => handleChange('token', e.target.value)}
              className="input-field mt-1.5"
            >
              <option value="XLM">XLM - Stellar Lumens</option>
              <option value="USDC">USDC - Stablecoin</option>
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div>
          <Label htmlFor="deadline">
            Submission Deadline
          </Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <Input
              id="deadline"
              type="number"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              placeholder="Unix timestamp"
              className="pl-10"
              required
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="input-helper">Unix timestamp when the bounty expires</p>
            <button
              type="button"
              onClick={() => handleChange('deadline', getRecommendedDeadline())}
              className="text-xs text-white hover:text-gray-300 transition-colors"
            >
              +30 days
            </button>
          </div>
        </div>

        {/* Summary */}
        {formData.amount && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Summary</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Reward</span>
              <span className="text-white font-medium">
                {parseFloat(formData.amount).toLocaleString()} {formData.token}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-500">Network</span>
              <span className="text-gray-300">Stellar (FutureNet)</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting || !connected}
          className="w-full"
        >
          {submitting ? (
            <>
              <span className="loading-spinner-sm" />
              Creating Bounty...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Review & fund escrow
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
