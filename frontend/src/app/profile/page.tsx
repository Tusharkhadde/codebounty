'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Plus, Trash2, WalletCards } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'

type SavedWallet = { id: string; network: string; address: string; label: string }
const storageKey = 'codebounty.saved-wallets'
const networks = ['Stellar Mainnet', 'Stellar Testnet', 'Stellar Futurenet', 'Ethereum', 'Polygon', 'Base', 'Solana']

export default function ProfilePage() {
  const { connected, address, connect, disconnect, connecting } = useWallet()
  const [wallets, setWallets] = useState<SavedWallet[]>([])
  const [network, setNetwork] = useState(networks[0])
  const [walletAddress, setWalletAddress] = useState('')
  const [label, setLabel] = useState('')

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) setWallets(JSON.parse(saved))
  }, [])

  const persist = (next: SavedWallet[]) => { setWallets(next); window.localStorage.setItem(storageKey, JSON.stringify(next)) }
  const addWallet = (event: React.FormEvent) => {
    event.preventDefault()
    if (!walletAddress.trim()) return
    persist([...wallets, { id: crypto.randomUUID(), network, address: walletAddress.trim(), label: label.trim() || 'My wallet' }])
    setWalletAddress(''); setLabel('')
  }

  return <div className="mx-auto max-w-4xl space-y-6 py-8">
    <section className="glass-card p-7 md:p-9"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <div><p className="text-xs font-semibold tracking-[0.16em] text-teal-300">ACCOUNT & PAYOUTS</p><h1 className="heading-lg mt-2">Your profile</h1><p className="mt-2 max-w-xl text-sm text-slate-400">Save payout addresses for the networks you use. Addresses are stored locally in this browser until secure profile storage is configured.</p></div>
      {connected ? <button onClick={disconnect} className="btn-secondary">Log out wallet</button> : <button onClick={connect} disabled={connecting} className="btn-primary">{connecting ? 'Connecting...' : 'Connect Freighter'}</button>}
    </div>{connected && <div className="mt-6 rounded-xl border border-teal-300/20 bg-teal-300/5 p-4 text-sm text-teal-100">Connected Stellar address: <code className="break-all text-white">{address}</code></div>}</section>
    <section className="glass-card p-7"><div className="mb-5 flex items-center gap-3"><WalletCards className="text-teal-300" /><div><h2 className="text-lg font-semibold">Saved payout wallets</h2><p className="text-sm text-slate-400">Add an address per network.</p></div></div>
      <form onSubmit={addWallet} className="grid gap-3 md:grid-cols-4"><select value={network} onChange={e => setNetwork(e.target.value)} className="input-field"><option value="">Select network</option>{networks.map(item => <option key={item}>{item}</option>)}</select><input value={label} onChange={e => setLabel(e.target.value)} className="input-field" placeholder="Label (optional)" /><input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} className="input-field md:col-span-2" placeholder="Wallet address" /><button className="btn-primary md:col-start-4"><Plus className="h-4 w-4" /> Save address</button></form>
      <div className="mt-6 space-y-3">{wallets.length === 0 ? <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">No payout wallets saved yet.</p> : wallets.map(wallet => <div key={wallet.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{wallet.label} <span className="ml-2 text-xs text-teal-300">{wallet.network}</span></p><code className="break-all text-xs text-slate-400">{wallet.address}</code></div><div className="flex gap-2"><button type="button" onClick={() => navigator.clipboard.writeText(wallet.address)} className="btn-icon" aria-label="Copy wallet address"><Copy className="h-4 w-4" /></button><button type="button" onClick={() => persist(wallets.filter(item => item.id !== wallet.id))} className="btn-icon text-red-300" aria-label="Remove wallet address"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>
    </section>
  </div>
}
