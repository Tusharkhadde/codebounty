'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * EmptyState - distinctive "nothing here yet" surface. Avoids emoji clutter
 * and the generic centered-illustration look by using a tuned radial glow,
 * a corner border-beam, and a mono eyebrow.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden flex flex-col items-center justify-center text-center gap-4 py-16 px-6 animate-fade-in-up',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(420px circle at 50% 0%, rgba(25,211,197,0.10), transparent 60%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[.04] text-[var(--accent)]">
            {icon}
          </div>
        )}
        <div className="space-y-1.5">
          <p className="text-sm font-mono uppercase tracking-widest text-[var(--accent)]/80">
            Empty
          </p>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action && <div className="mt-1">{action}</div>}
      </div>
    </Card>
  )
}

export default EmptyState
