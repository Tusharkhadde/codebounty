'use client'

import Link from 'next/link'
import { ArrowRight, Bot, CheckCircle2, Github, LockKeyhole, Wallet } from 'lucide-react'
import { EtherealBeamsHero } from '@/components/ui/ethereal-beams-hero'
import { Spotlight } from '@/components/ui/spotlight'
import { BorderBeam } from '@/components/ui/border-beam'
import { AnimatedNumber } from '@/components/ui/animated-number'

const steps = [
  { icon: Github, title: 'Choose the issue', text: 'Paste a GitHub issue URL and define the reward, token, and deadline.' },
  { icon: Wallet, title: 'Fund the escrow', text: 'Review the transaction and approve the deposit from your own wallet.' },
  { icon: Bot, title: 'Verify the merge', text: 'The relay checks the linked pull request and submits a signed proof after it merges.' },
  { icon: CheckCircle2, title: 'Release the reward', text: 'The Soroban contract pays the contributor only after verification succeeds.' },
]

const protocols = ['Soroban', 'Stellar', 'GitHub', 'Freighter', 'Futurenet', 'XLM', 'Soroban CLI', 'Horizon']

export default function Home() {
  return <main className="space-y-24 pb-12 pt-6 md:pt-10">
    <EtherealBeamsHero onCreate={() => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })} />

    <section className="grid gap-5 md:grid-cols-[1.15fr_.85fr]" aria-labelledby="escrow-heading">
      <div><p className="eyebrow">Designed for both sides of open source</p><h2 id="escrow-heading" className="heading-lg mt-3 max-w-xl">A bounty flow that keeps everyone honest.</h2><p className="mt-5 max-w-2xl text-slate-400">Maintainers decide the reward. Contributors see exactly what has been funded. The verification relay can check a merge, but it never controls the funds.</p></div>
      <Spotlight className="glass-card rounded-2xl p-6">
        <LockKeyhole className="h-6 w-6 text-teal-300" />
        <h3 className="mt-4 font-semibold">Smart contract, not AI custody</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">An AI-assisted relay may help monitor GitHub events, but the funds stay in the deployed Soroban escrow until contract conditions are satisfied.</p>
      </Spotlight>
    </section>

    <section aria-label="Trusted protocols" className="marquee-mask -mx-4 overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-10 pr-10" style={{ ['--marquee-duration' as string]: '28s' }}>
        {[...protocols, ...protocols].map((p, i) => (
          <span key={i} className="font-mono text-sm tracking-wide text-slate-500/70 whitespace-nowrap">{p}</span>
        ))}
      </div>
    </section>

    <section><div className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">The bounty lifecycle</p><h2 className="heading-lg mt-3">Four clear steps. One verifiable payout.</h2></div><Link href="/about" className="hidden text-sm text-teal-300 hover:text-teal-100 sm:inline-flex sm:items-center sm:gap-1">How it works <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map((step, index) => <Spotlight key={step.title} className="glass-card group rounded-2xl p-6">
        <span className="text-sm font-semibold text-teal-300">0{index + 1}</span>
        <step.icon className="mt-8 h-6 w-6 text-white transition-colors group-hover:text-teal-300" />
        <h3 className="mt-5 font-semibold">{step.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
      </Spotlight>)}</div>
    </section>

    <section id="start" className="relative overflow-hidden rounded-[2rem] border border-teal-200/15 bg-gradient-to-br from-teal-300/10 via-[#0c1520] to-blue-500/10 p-8 text-center md:p-14">
      <BorderBeam colorFrom="#19d3c5" colorTo="#38bdf8" duration={16} borderWidth={1.5} />
      <p className="eyebrow text-teal-200">Ready to fund real work?</p>
      <h2 className="heading-lg mx-auto mt-3 max-w-2xl">Create your first bounty with a wallet you control.</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300">Start by setting your payout addresses, connect Freighter, then create and fund an escrow-backed bounty.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/profile" className="btn-secondary px-7 py-3.5">Set up profile</Link><Link href="/login" className="btn-primary px-7 py-3.5">Connect wallet <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-center">
        <div><div className="text-2xl font-bold text-white font-mono md:text-3xl"><AnimatedNumber value={100} suffix="%" /></div><div className="mt-1 text-xs text-slate-400">On-chain escrow</div></div>
        <div><div className="text-2xl font-bold text-white font-mono md:text-3xl"><AnimatedNumber value={0} suffix="ms" /></div><div className="mt-1 text-xs text-slate-400">Relay latency</div></div>
        <div><div className="text-2xl font-bold text-white font-mono md:text-3xl"><AnimatedNumber value={2} /></div><div className="mt-1 text-xs text-slate-400">Wallets needed</div></div>
      </div>
    </section>
  </main>
}
