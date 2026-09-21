import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    title: 'Open a GitHub issue',
    body: 'Describe the bug or feature in the repository you already maintain.',
  },
  {
    title: 'Create and fund the bounty',
    body: 'Paste the issue URL, set a reward, and lock funds in Stellar escrow.',
  },
  {
    title: 'Link the pull request',
    body: 'A contributor attaches the PR that solves the issue.',
  },
  {
    title: 'Verify the merge and release',
    body: 'After the PR merges, the relay can verify the work and the payout can proceed.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-black">
      <section className="container-main py-14 sm:py-20">
        <p className="text-sm font-medium text-zinc-500">How it works</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          A clear path from issue to payout.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
          CodeBounty is a GitHub bounty board with Stellar escrow. Watch the landing demo for the
          path from issue to payout, then open the app to browse or create work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/bounties" className="btn-primary h-11 px-5">
            Open the bounty board
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/bounties/create" className="btn-secondary h-11 px-5">
            Create a bounty
          </Link>
        </div>
      </section>

      <section className="container-main grid gap-4 pb-16 md:grid-cols-2">
        <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-zinc-800">
          <Image
            src="/landing/ui-escrow-funded.png"
            alt="Funded bounty with locked Stellar escrow"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-zinc-800">
          <Image
            src="/landing/ui-pr-paid.png"
            alt="Merged pull request with payout released"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="container-main pb-20">
        <ol className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                Step {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="mt-3 text-lg font-medium">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/login" className="btn-primary h-11 px-5">
            Sign in with GitHub
          </Link>
          <Link href="/" className="btn-secondary h-11 px-5">
            Back to landing
          </Link>
        </div>
      </section>
    </div>
  )
}
