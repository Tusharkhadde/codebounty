'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Check, Github, LockKeyhole, Wallet } from 'lucide-react'

export function ProtectedActionGate({ children, action = 'continue' }: { children: React.ReactNode; action?: string }) {
  const { connected, connecting, connect, enableDemoMode, demoMode } = useWallet()
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null)
  useEffect(() => { fetch('/api/auth/me').then(r => r.json()).then(data => setGithubConnected(Boolean(data.authenticated))).catch(() => setGithubConnected(false)) }, [])
  if (githubConnected && (connected || demoMode)) return <>{children}</>
  const githubReady = githubConnected === true
  return <section className="mx-auto max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8"><p className="text-sm font-medium text-zinc-500">Before you {action}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Set up your contributor identity</h2><p className="mt-3 text-sm leading-6 text-zinc-400">GitHub verifies the work and your wallet signs escrow transactions. We’ll return you here automatically once each step is complete.</p><div className="mt-7 space-y-3"><div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"><div className="flex items-center gap-3"><Github className="h-5 w-5"/><div><p className="text-sm font-medium">GitHub account</p><p className="text-xs text-zinc-500">Required to verify identity and submissions.</p></div></div>{githubReady ? <Check className="h-5 w-5 text-zinc-200"/> : <a className="btn-primary h-8 text-xs" href={`/api/auth/github?next=${encodeURIComponent(typeof window === 'undefined' ? '/bounties/create' : window.location.pathname)}`}>Connect GitHub</a>}</div><div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4"><div className="flex items-center gap-3"><Wallet className="h-5 w-5"/><div><p className="text-sm font-medium">Stellar wallet</p><p className="text-xs text-zinc-500">Required for escrow, payments, and transactions.</p></div></div>{connected || demoMode ? <Check className="h-5 w-5 text-zinc-200"/> : <div className="flex gap-2"><Button size="sm" onClick={() => connect()} disabled={connecting}>{connecting ? 'Connecting' : 'Connect'}</Button><Button size="sm" variant="outline" onClick={enableDemoMode}>Demo</Button></div>}</div></div><div className="mt-5 flex items-center gap-2 text-xs text-zinc-500"><LockKeyhole className="h-3.5 w-3.5"/>Your setup progress stays on this device.</div></section>
}
