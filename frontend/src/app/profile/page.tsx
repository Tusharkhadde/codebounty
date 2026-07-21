'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Copy,
  Plus,
  Trash2,
  WalletCards,
  User,
  Github,
  Award,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  Settings,
  Bell,
  Code2,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

type SavedWallet = { id: string; network: string; address: string; label: string }
const storageKey = 'codebounty.saved-wallets'
const networks = ['Stellar Testnet', 'Stellar Mainnet', 'Stellar Futurenet', 'Ethereum', 'Polygon', 'Base', 'Solana']

export default function ProfilePage() {
  const { connected, address, connect, disconnect, connecting } = useWallet()
  const [wallets, setWallets] = useState<SavedWallet[]>([])
  const [network, setNetwork] = useState(networks[0])
  const [walletAddress, setWalletAddress] = useState('')
  const [label, setLabel] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'wallets' | 'activity' | 'settings'>('wallets')

  // User Profile details from local storage or defaults
  const [userProfile, setUserProfile] = useState({
    username: 'stellar_developer',
    email: 'developer@stellar.org',
    role: 'Hunter / Developer',
    githubLinked: false,
    githubUser: 'octocat',
    registeredAt: 'July 2026'
  })

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) setWallets(JSON.parse(saved))

    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && data.user) {
            setUserProfile(prev => ({
              ...prev,
              username: data.user.login,
              githubUser: data.user.login,
              githubLinked: true
            }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch session', err)
      }
    }
    fetchSession()

    const reg = window.localStorage.getItem('codebounty.user-registration')
    if (reg) {
      try {
        const parsed = JSON.parse(reg)
        setUserProfile(prev => ({
          ...prev,
          email: parsed.email || prev.email,
          role: parsed.role === 'sponsor' ? 'Sponsor / Project Lead' : 'Hunter / Developer'
        }))
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const persist = (next: SavedWallet[]) => {
    setWallets(next)
    window.localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const addWallet = (event: React.FormEvent) => {
    event.preventDefault()
    if (!walletAddress.trim()) return
    persist([
      ...wallets,
      {
        id: crypto.randomUUID(),
        network,
        address: walletAddress.trim(),
        label: label.trim() || `${network} Payout`
      }
    ])
    setWalletAddress('')
    setLabel('')
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-6">

      {/* Profile Header & Summary Card */}
      <section className="glass-card overflow-hidden p-0 border-teal-500/20">
        {/* Decorative Top Gradient Cover */}
        <div className="h-32 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-emerald-500/20 relative">
          <div className="absolute right-6 top-6 flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-black/40 px-3 py-1 text-xs text-teal-300 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" /> Identity Verified
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-12">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 p-1 shadow-xl shadow-teal-500/20 ring-4 ring-[#06080d]">
              <div className="h-full w-full rounded-[0.85rem] bg-surface flex items-center justify-center text-3xl font-bold text-teal-300">
                {userProfile.username.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="heading-md font-bold">{userProfile.username}</h1>
                <span className="rounded-full bg-teal-400/10 border border-teal-300/20 px-3 py-0.5 text-xs font-semibold text-teal-300">
                  {userProfile.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{userProfile.email}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Github className="h-3.5 w-3.5 text-slate-300" /> @{userProfile.githubUser}
                </span>
                <span>•</span>
                <span>Member since {userProfile.registeredAt}</span>
              </div>
            </div>
          </div>

          {/* Quick Wallet Connect Action */}
          <div className="flex items-center gap-3">
            {connected ? (
              <button onClick={disconnect} className="btn-secondary text-xs">
                Disconnect Wallet
              </button>
            ) : (
              <button onClick={connect} disabled={connecting} className="btn-primary text-xs shadow-lg shadow-teal-500/20">
                <WalletCards className="h-4 w-4" />
                {connecting ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Connected Wallet Ribbon */}
        {connected && (
          <div className="border-t border-white/10 bg-teal-300/5 px-6 py-3 text-xs text-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
              Active Stellar Address: <code className="break-all font-mono text-white">{address}</code>
            </span>
            <button
              onClick={() => address && copyToClipboard(address, 'connected-wallet')}
              className="text-xs text-teal-300 hover:text-white flex items-center gap-1 font-medium"
            >
              {copiedId === 'connected-wallet' ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedId === 'connected-wallet' ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </section>

      {/* Stats Summary Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Earned</span>
            <DollarSign className="h-4 w-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">$1,250.00</p>
          <p className="text-[11px] text-teal-400 font-medium">↑ 3 Bounties Claimed</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Bounties Funded</span>
            <Award className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">2 Issues</p>
          <p className="text-[11px] text-slate-400 font-medium">$500 Escrowed</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Wallets</span>
            <WalletCards className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{wallets.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">Multi-chain ready</p>
        </div>

        <div className="glass-card p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Trust Rating</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">99.8%</p>
          <p className="text-[11px] text-emerald-400 font-medium">Top Contributor</p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 text-sm font-medium">
        <button
          onClick={() => setActiveTab('wallets')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'wallets'
              ? 'border-teal-400 text-teal-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <WalletCards className="h-4 w-4" /> Payout Addresses ({wallets.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'activity'
              ? 'border-teal-400 text-teal-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" /> Recent Activity
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-teal-400 text-teal-300 font-semibold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" /> Settings & Security
        </button>
      </div>

      {/* Tab 1: Payout Wallets */}
      {activeTab === 'wallets' && (
        <section className="glass-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <WalletCards className="text-teal-300 h-5 w-5" /> Saved Payout Addresses
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add your multi-chain payout addresses to receive bounty rewards directly when your pull requests are merged.
            </p>
          </div>

          {/* Add Wallet Form */}
          <form onSubmit={addWallet} className="grid gap-3 md:grid-cols-4 rounded-xl bg-white/[0.02] p-4 border border-white/10">
            <div>
              <label className="input-label text-[11px]">Network</label>
              <select value={network} onChange={e => setNetwork(e.target.value)} className="input-field text-xs py-2.5">
                {networks.map(item => (
                  <option key={item} value={item} className="bg-surface-raised text-white">{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label text-[11px]">Label Name</label>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="input-field text-xs py-2.5"
                placeholder="e.g. Main Payout Vault"
              />
            </div>
            <div className="md:col-span-2">
              <label className="input-label text-[11px]">Wallet Address</label>
              <div className="flex gap-2">
                <input
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  className="input-field text-xs py-2.5 flex-1"
                  placeholder="G... or 0x..."
                  required
                />
                <button type="submit" className="btn-primary text-xs px-4 py-2.5 whitespace-nowrap">
                  <Plus className="h-3.5 w-3.5" /> Save Address
                </button>
              </div>
            </div>
          </form>

          {/* Saved Wallets List */}
          <div className="space-y-3">
            {wallets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-slate-400 space-y-2">
                <WalletCards className="h-8 w-8 mx-auto text-slate-500" />
                <p className="font-medium text-slate-300">No payout wallets saved yet</p>
                <p className="text-[11px]">Add your Stellar or EVM address above to receive automatic bounty rewards.</p>
              </div>
            ) : (
              wallets.map(wallet => (
                <div
                  key={wallet.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between hover:border-teal-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">{wallet.label}</span>
                      <span className="rounded-full bg-teal-400/10 border border-teal-300/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                        {wallet.network}
                      </span>
                    </div>
                    <code className="break-all text-xs font-mono text-slate-400">{wallet.address}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(wallet.address, wallet.id)}
                      className="btn-icon text-slate-400 hover:text-white"
                      title="Copy Address"
                    >
                      {copiedId === wallet.id ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => persist(wallets.filter(item => item.id !== wallet.id))}
                      className="btn-icon text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Remove Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Tab 2: Recent Activity */}
      {activeTab === 'activity' && (
        <section className="glass-card p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="text-teal-300 h-5 w-5" /> Activity History
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-400/10 text-teal-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">Bounty Claimed: Fix Stellar SDK Memory Leak</p>
                  <p className="text-[11px] text-slate-400">PR #42 merged • Paid 500 XLM via Soroban Escrow</p>
                </div>
              </div>
              <span className="text-slate-400 text-[11px]">2 hours ago</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-300">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">Pull Request Linked to Issue #108</p>
                  <p className="text-[11px] text-slate-400">Awaiting maintainer verification</p>
                </div>
              </div>
              <span className="text-slate-400 text-[11px]">Yesterday</span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'settings' && (
        <section className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-teal-300 h-5 w-5" /> Account Settings
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div>
                <p className="font-semibold text-white">GitHub OAuth Account</p>
                <p className="text-[11px] text-slate-400">Used for PR verification and issue linking</p>
              </div>
              <a href="/api/auth/github" className="btn-secondary text-xs">
                <Github className="h-3.5 w-3.5" /> Reconnect GitHub
              </a>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div>
                <p className="font-semibold text-white">Email Notifications</p>
                <p className="text-[11px] text-slate-400">Get alerted when your linked PRs are funded or paid out</p>
              </div>
              <input type="checkbox" defaultChecked className="accent-teal-400 h-4 w-4" />
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
