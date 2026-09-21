'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Pause, Play } from 'lucide-react'

const stages = [
  {
    title: 'Paste a GitHub issue',
    body: 'The maintainer starts from a real issue URL. That issue is the work being funded.',
    image: '/landing/ui-create-issue.png',
    alt: 'Create bounty form with a GitHub issue URL and XLM reward',
    href: '/bounties/create',
    action: 'Create a bounty',
  },
  {
    title: 'Lock the reward in escrow',
    body: 'The payout is funded on Stellar so the reward is visible before anyone writes the patch.',
    image: '/landing/ui-escrow-funded.png',
    alt: 'Bounty detail with funded escrow and progress stepper',
    href: '/bounties/create',
    action: 'Fund an issue',
  },
  {
    title: 'A hunter links a pull request',
    body: 'The contributor attaches the PR that solves the issue. Everyone sees the same status.',
    image: '/landing/hero-bounty-board.png',
    alt: 'Bounty board showing funded and PR-linked cards',
    href: '/bounties',
    action: 'Browse bounties',
  },
  {
    title: 'Merge is verified, then paid',
    body: 'After the PR merges, the relay can verify the work and the escrow can release.',
    image: '/landing/ui-pr-paid.png',
    alt: 'Completed bounty with merged pull request and payout released',
    href: '/bounties',
    action: 'Open the board',
  },
]

const INTERVAL_MS = 2800

export function HowItWorksPlay() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const stage = stages[index]

  useEffect(() => {
    if (!playing) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) {
      setPlaying(false)
      return
    }
    const timer = window.setInterval(() => {
      setIndex(current => (current + 1) % stages.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <section className="container-main py-16 sm:py-24" aria-labelledby="how-it-works-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-zinc-500">How the platform works</p>
          <h2 id="how-it-works-heading" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Issue, escrow, merge, payout.
          </h2>
        </div>
        <button
          type="button"
          className="btn-secondary h-9 w-fit px-3"
          onClick={() => setPlaying(value => !value)}
          aria-pressed={playing}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? 'Pause demo' : 'Play demo'}
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <ol className="grid border-b border-zinc-800 sm:grid-cols-4">
          {stages.map((item, stepIndex) => {
            const active = stepIndex === index
            return (
              <li key={item.title} className="border-zinc-800 sm:border-r sm:last:border-r-0">
                <button
                  type="button"
                  onClick={() => {
                    setIndex(stepIndex)
                    setPlaying(false)
                  }}
                  className={`flex min-h-[5.5rem] w-full flex-col items-start gap-1 px-4 py-4 text-left ${
                    active ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className="text-xs uppercase tracking-[0.16em]">{String(stepIndex + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative min-h-[260px] bg-black lg:min-h-[360px]">
            <Image
              key={stage.image + index}
              src={stage.image}
              alt={stage.alt}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-top play-rise"
            />
            <div className="play-track" aria-hidden="true">
              <span className="play-token" />
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Step {String(index + 1).padStart(2, '0')} of 04
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{stage.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{stage.body}</p>
            <Link href={stage.href} className="btn-primary mt-6 h-11 w-fit px-5">
              {stage.action}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
