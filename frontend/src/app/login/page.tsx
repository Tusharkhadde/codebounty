'use client'

import Link from 'next/link'
import { Github, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  return <main className="mx-auto flex min-h-[65vh] max-w-xl items-center py-10"><section className="glass-card w-full p-8 text-center md:p-10">
    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10"><ShieldCheck className="text-teal-300" /></div>
    <p className="text-xs font-semibold tracking-[0.16em] text-teal-300">GITHUB-ONLY ACCESS</p><h1 className="heading-lg mt-3">Sign in to CodeBounty</h1>
    <p className="mt-3 text-sm leading-6 text-slate-400">Use your GitHub identity to create bounties, link pull requests, and receive verified payouts. Your wallet is connected separately when funding.</p>
    <a href="/api/auth/github" className="btn-primary mt-7 w-full"><Github className="h-4 w-4" />Continue with GitHub</a><Link href="/profile" className="mt-5 inline-block text-sm text-teal-300 hover:text-teal-100">Set up payout wallets first</Link>
  </section></main>
}
