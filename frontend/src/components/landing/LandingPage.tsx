'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Github, GitPullRequest, LockKeyhole, Wallet } from 'lucide-react'
import type { PlatformStats } from '@/lib/bounty-stats'
import { HowItWorksPlay } from '@/components/landing/HowItWorksPlay'

const panels = [
  {
    title: 'Start from a GitHub issue',
    body: 'Paste the issue your repo already needs. The bounty is attached to that work, not a vague task list.',
    href: '/bounties/create',
    action: 'Create a bounty',
    image: '/landing/ui-create-issue.png',
    alt: 'Create bounty form with GitHub issue URL and reward fields',
  },
  {
    title: 'Fund visible Stellar escrow',
    body: 'Lock XLM in escrow so contributors can see the reward before they open a pull request.',
    href: '/bounties/create',
    action: 'Fund an issue',
    image: '/landing/ui-escrow-funded.png',
    alt: 'Funded bounty screen with escrow locked and status stepper',
  },
  {
    title: 'Pay after the merge',
    body: 'Link the PR. When it merges, verification can release the payout to the contributor.',
    href: '/bounties',
    action: 'Browse open work',
    image: '/landing/ui-pr-paid.png',
    alt: 'Paid bounty screen with merged pull request and payout released',
  },
]

function formatStat(value: number) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function LandingPage({ stats }: { stats: PlatformStats }) {
  return (
    <div className="bg-black">
      <section className="container-main grid items-center gap-10 py-12 lg:grid-cols-[1fr_1.05fr] lg:py-20">
        <div className="play-rise">
          <p className="text-sm font-medium text-zinc-400">GitHub issues / Stellar escrow / paid merges</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-6xl">
            Fund a GitHub issue. Pay the merge.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            CodeBounty is a bounty board for real repository work. Maintainers fund an issue,
            hunters link a pull request, and payout follows a visible Stellar escrow path.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bounties" className="btn-primary h-11 px-5">
              Enter the app
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/bounties/create" className="btn-secondary h-11 px-5">
              Create a bounty
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center px-2 text-sm text-zinc-300 hover:text-white">
              Sign in with GitHub
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 play-rise">
          <div className="relative aspect-[16/10]">
            <Image
              src="/landing/hero-bounty-board.png"
              alt="CodeBounty board with GitHub issues, XLM rewards, and funded status"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
            <span>Live board preview</span>
            <Link href="/bounties" className="text-zinc-200 hover:text-white">
              Open bounties
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-800">
        <div className="container-main grid gap-8 py-8 sm:grid-cols-3">
          {stats.indexed ? (
            <>
              <Stat label="Open bounties" value={formatStat(stats.openBounties)} />
              <Stat label="Paid out" value={formatStat(stats.paidBounties)} />
              <Stat label="Open escrow" value={`${formatStat(stats.totalEscrowXlm)} XLM`} />
            </>
          ) : (
            <div className="sm:col-span-3">
              <p className="text-sm text-zinc-400">
                {stats.source === 'unconfigured'
                  ? 'Live bounty totals appear after the database is connected. No indexed on-chain activity is shown yet.'
                  : 'No indexed bounties yet. Open work will appear here once a bounty is created and stored.'}
              </p>
            </div>
          )}
        </div>
      </section>

      <HowItWorksPlay />

      <section className="container-main pb-16 sm:pb-24">
        <div className="grid gap-5 md:grid-cols-3">
          {panels.map(item => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
              <div className="relative aspect-[4/3]">
                <Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover object-top" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
                <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-200 hover:text-white">
                  {item.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-main pb-16 sm:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <ValueCard
            icon={Wallet}
            title="Fund real work"
            body="Create a reward for a GitHub issue without a spreadsheet or a middleman holding the money."
          />
          <ValueCard
            icon={GitPullRequest}
            title="Track the contribution"
            body="Link the pull request that solves the issue so maintainers and hunters see the same state."
          />
          <ValueCard
            icon={LockKeyhole}
            title="Release with a record"
            body="Use the Stellar escrow path so the handoff is explicit, auditable, and not invented off-chain."
          />
        </div>
      </section>

      <section className="container-main pb-16 sm:pb-20">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Built around GitHub and Freighter.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Sign in with GitHub to prove identity. Connect Freighter when you are ready to fund
                or claim. No demo numbers are shown as live chain activity.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary h-11 px-5">
                <Github className="h-4 w-4" />
                Continue with GitHub
              </Link>
              <Link href="/about" className="btn-secondary h-11 px-5">
                Read the workflow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">{value}</p>
    </div>
  )
}

function ValueCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Wallet
  title: string
  body: string
}) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <Icon className="h-5 w-5 text-zinc-300" />
      <h3 className="mt-6 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </article>
  )
}
