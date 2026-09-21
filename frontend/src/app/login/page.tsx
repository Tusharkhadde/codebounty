'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Github, AlertCircle, CheckCircle2 } from 'lucide-react'
import { BrandMark } from '@/components/BrandLockup'

function LoginContent() {
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const errorParam = searchParams?.get('error')

  useEffect(() => {
    if (errorParam === 'github-not-configured') {
      setErrorMsg('GitHub OAuth is not configured on this environment.')
    } else if (errorParam === 'invalid-state' || errorParam === 'github-auth-failed') {
      setErrorMsg('GitHub authentication failed or expired. Please try again.')
    }
  }, [errorParam])

  return (
    <div className="container-main grid min-h-[75vh] items-center gap-10 py-12 lg:grid-cols-2">
      <div>
        <p className="text-sm font-medium text-zinc-500">Sign in</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Continue with the GitHub account that owns the work.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-zinc-400">
          CodeBounty uses GitHub to verify identity before you create a bounty or link a pull request.
          Connect Freighter later when you are ready to fund or claim.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-zinc-300">
          {[
            'Link GitHub issues and pull requests to a visible payout',
            'Sign escrow transactions from your own Freighter wallet',
            'Keep contributor payout addresses under your control',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-8 sm:p-10">
        <BrandMark size={40} />
        <h2 className="mt-6 text-xl font-semibold">Sign in</h2>
        <p className="mt-2 text-sm text-zinc-400">Authenticate with GitHub to enter the app.</p>

        {errorMsg && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-3.5 text-xs text-zinc-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <a href="/api/auth/github" className="btn-primary mt-8 h-11 w-full">
          <Github className="h-4 w-4" />
          Continue with GitHub
        </a>
        <p className="mt-4 text-center text-[11px] leading-5 text-zinc-500">
          By signing in you allow CodeBounty to confirm GitHub identity for bounty creation and PR linking.
        </p>
        <p className="mt-6 text-center text-xs text-zinc-500">
          New here?{' '}
          <Link href="/signup" className="text-zinc-200 hover:text-white">
            Create a profile
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container-main flex min-h-[60vh] items-center justify-center text-sm text-zinc-400">
          Loading sign in...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
