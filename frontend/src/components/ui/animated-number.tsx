'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * AnimatedNumber - smooth count-up using requestAnimationFrame.
 * Used for headline stats on the dashboard. Honors prefers-reduced-motion
 * by snapping to the final value.
 */
interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = React.useState(0)
  const rafRef = React.useRef<number>()
  const startRef = React.useRef<number>()

  React.useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setDisplay(value)
      return
    }

    startRef.current = undefined
    const step = (ts: number) => {
      if (startRef.current === undefined) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setDisplay(value)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span className={cn('tnum', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

export default AnimatedNumber
