'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * BorderBeam - animated rotating conic beam that travels the perimeter of a
 * container. Adapted from VengenceUI to the Stellar teal palette.
 *
 * Wrap a relatively-positioned parent; the beam is absolutely positioned and
 * masked to the border. Respects prefers-reduced-motion.
 */
interface BorderBeamProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  duration?: number
  anchor?: number
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
  className?: string
  beamClassName?: string
}

export function BorderBeam({
  size = 300,
  duration = 14,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = '#19d3c5',
  colorTo = '#38bdf8',
  delay = 0,
  className,
  beamClassName,
  ...props
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--bb-border-width,1.5px))_solid_transparent] ![mask-composite:intersect] [mask:linear-gradient(#000_0_0)_padding-box,linear-gradient(#000_0_0)]',
        className
      )}
      style={
        {
          '--bb-border-width': `${borderWidth}px`,
          '--bb-size': size,
          '--bb-duration': `${duration}s`,
          '--bb-anchor': anchor,
          '--bb-delay': `${delay}s`,
          '--bb-color-from': colorFrom,
          '--bb-color-to': colorTo,
        } as React.CSSProperties
      }
    >
      <div className="absolute aspect-square w-[var(--bb-size)] animate-border-beam [animation-delay:var(--bb-delay)] [background:conic-gradient(from_calc(var(--bb-anchor)*1deg),transparent_0%,var(--bb-color-from)_10%,var(--bb-color-to)_20%,transparent_30%)] [inset:0_auto_auto_0] [mask:conic-gradient(from_calc(var(--bb-anchor)*1deg),transparent_0%,black_10%,black_20%,transparent_30%)]" />
    </div>
  )
}

export default BorderBeam
