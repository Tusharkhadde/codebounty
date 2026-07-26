import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Input - themed text input matching the dark Stellar design system.
 * Uses surface-raised background, card-border, and accent focus glow.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100',
        'placeholder:text-[var(--muted)] transition-[color,box-shadow,border-color] duration-200',
        'focus-visible:outline-none focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-300/20',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-[var(--error)] aria-invalid:ring-[var(--error)]/20',
        className
      )}
      {...props}
    />
  )
}

export { Input }
