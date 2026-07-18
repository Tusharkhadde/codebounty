import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Badge - compact status pill with semantic variants.
 * Includes status variants used across bounty states.
 */
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--accent)]/15 text-[var(--accent)]',
        secondary:
          'border-transparent bg-white/10 text-gray-200',
        outline:
          'border-[var(--card-border)] text-gray-300',
        success:
          'border-transparent bg-[var(--success)]/15 text-[var(--success)]',
        warning:
          'border-transparent bg-[var(--warning)]/15 text-[var(--warning)]',
        destructive:
          'border-transparent bg-[var(--error)]/15 text-[var(--error)]',
        info:
          'border-transparent bg-sky-500/15 text-sky-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }