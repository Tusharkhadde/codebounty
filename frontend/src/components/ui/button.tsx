import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Button variants tuned for the dark CodeBounty / Stellar theme.
 * - default: teal accent with glow (primary CTA)
 * - secondary: raised surface with hover border
 * - outline: transparent with accent border
 * - ghost: low-impact text/hover
 * - destructive: red error palette
 * - success: green confirmation palette
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold font-sans transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] text-white shadow-[0_0_20px_-5px_var(--accent-glow)] hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_var(--accent-glow)]',
        secondary:
          'bg-[var(--surface-raised)] text-white border border-[var(--card-border)] hover:bg-[var(--surface-hover)] hover:border-[var(--accent)] hover:-translate-y-0.5',
        outline:
          'bg-transparent text-white border border-[var(--card-border)] hover:border-[var(--accent)] hover:bg-white/[.06] hover:text-[var(--accent)]',
        ghost:
          'text-gray-400 hover:text-white hover:bg-white/[.08] border border-transparent',
        destructive:
          'bg-[var(--error)] text-white shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)] hover:bg-red-600 hover:-translate-y-0.5',
        success:
          'bg-[var(--success)] text-[#042f2e] shadow-[0_0_20px_-5px_rgba(94,234,212,0.4)] hover:brightness-110 hover:-translate-y-0.5',
        link: 'text-[var(--accent)] underline-offset-4 hover:underline rounded-none',
      },
      size: {
        default: 'h-10 px-6 py-2.5',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }