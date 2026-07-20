'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Spotlight - a card wrapper that reveals a radial light tracking the cursor.
 * Adapted from VengenceUI to the Stellar teal palette. Respects
 * prefers-reduced-motion via the CSS transition override in globals.css.
 */
interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Spotlight({ className, children, ...props }: SpotlightProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn('spotlight-card', className)}
      style={
        pos
          ? ({ '--spotlight-x': `${pos.x}px`, '--spotlight-y': `${pos.y}px` } as React.CSSProperties)
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  )
}

export default Spotlight
