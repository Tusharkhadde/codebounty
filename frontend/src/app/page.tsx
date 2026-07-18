'use client'

import Link from 'next/link'
import { ArrowRight, Bot, CheckCircle2, Github, LockKeyhole, Wallet } from 'lucide-react'
import { EtherealBeamsHero } from '@/components/ui/ethereal-beams-hero'

const steps = [
  { icon: Github, title: 'Choose the issue', text: 'Paste a GitHub issue URL and define the reward, token, and deadline.' },
  { icon: Wallet, title: 'Fund the escrow', text: 'Review the transaction and approve the deposit from your own wallet.' },
  { icon: Bot, title: 'Verify the merge', text: 'The relay checks the linked pull request and submits a signed proof after it merges.' },
  { icon: CheckCircle2, title: 'Release the reward', text: 'The Soroban contract pays the contributor only after verification succeeds.' },
]

export default function Home() {
  return <main className="space-y-24 pb-12 pt-6 md:pt-10">
    <EtherealBeamsHero onCreate={() => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })} />

    <section className="grid gap-5 md:grid-cols-[1.15fr_.85fr]" aria-labelledby="escrow-heading">
      <div><p className="text-xs font-semibold tracking-[0.16em] text-teal-300">DESIGNED FOR BOTH SIDES OF OPEN SOURCE</p><h2 id="escrow-heading" className="heading-lg mt-3 max-w-xl">A bounty flow that keeps everyone honest.</h2><p className="mt-5 max-w-2xl text-slate-400">Maintainers decide the reward. Contributors see exactly what has been funded. The verification relay can check a merge, but it never controls the funds.</p></div>
      <div className="glass-card p-6"><LockKeyhole className="h-6 w-6 text-teal-300" /><h3 className="mt-4 font-semibold">Smart contract, not AI custody</h3><p className="mt-2 text-sm leading-6 text-slate-400">An AI-assisted relay may help monitor GitHub events, but the funds stay in the deployed Soroban escrow until contract conditions are satisfied.</p></div>
    </section>

    <section><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold tracking-[0.16em] text-teal-300">THE BOUNTY LIFECYCLE</p><h2 className="heading-lg mt-3">Four clear steps. One verifiable payout.</h2></div><Link href="/about" className="hidden text-sm text-teal-300 hover:text-teal-100 sm:inline-flex sm:items-center sm:gap-1">How it works <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map((step, index) => <article key={step.title} className="glass-card group p-6"><span className="text-sm font-semibold text-teal-300">0{index + 1}</span><step.icon className="mt-8 h-6 w-6 text-white transition-colors group-hover:text-teal-300" /><h3 className="mt-5 font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p></article>)}</div>
    </section>

    <section id="start" className="overflow-hidden rounded-[2rem] border border-teal-200/15 bg-gradient-to-br from-teal-300/10 via-[#0c1520] to-blue-500/10 p-8 text-center md:p-14"><p className="text-xs font-semibold tracking-[0.16em] text-teal-200">READY TO FUND REAL WORK?</p><h2 className="heading-lg mx-auto mt-3 max-w-2xl">Create your first bounty with a wallet you control.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">Start by setting your payout addresses, connect Freighter, then create and fund an escrow-backed bounty.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/profile" className="btn-secondary px-7 py-3.5">Set up profile</Link><Link href="/login" className="btn-primary px-7 py-3.5">Connect wallet <ArrowRight className="h-4 w-4" /></Link></div></section>
  </main>
}
