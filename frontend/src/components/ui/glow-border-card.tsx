'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Props for the GlowBorderCard component.
 * Adapted from VengenceUI to the dark CodeBounty / Stellar theme.
 */
export interface GlowBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  width?: string
  height?: string
  aspectRatio?: string
  borderRadius?: string
  animationDuration?: number
  gradientColors?: string[]
  borderWidth?: string
  blurAmount?: string
  inset?: string
  colorPreset?: 'nature' | 'ocean' | 'sunset' | 'aurora' | 'stellar' | 'custom'
  paused?: boolean
}

// Preset gradient colors (10 colors each for smooth transitions)
const colorPresets: Record<string, string[]> = {
  nature: ['#669900', '#88bb22', '#99cc33', '#aaddaa', '#ccee66', '#006699', '#228888', '#3399cc', '#55aacc', '#669900'],
  ocean: ['#006699', '#1177aa', '#2288bb', '#3399cc', '#44aadd', '#55bbee', '#66ccff', '#44bbee', '#2299cc', '#006699'],
  sunset: ['#ff6600', '#ff7711', '#ff8822', '#ff9900', '#ffaa22', '#ffbb44', '#ffcc00', '#ff9933', '#ff7722', '#ff6600'],
  aurora: ['#00ff87', '#22ffaa', '#44ffcc', '#60efff', '#88ddff', '#bb99ff', '#dd77ee', '#ff68f0', '#ff55cc', '#00ff87'],
  stellar: ['#19d3c5', '#5eead4', '#0fa99f', '#22d3ee', '#38bdf8', '#818cf8', '#a78bfa', '#5eead4', '#19d3c5', '#0fa99f'],
  custom: ['#669900', '#99cc33', '#ccee66', '#006699', '#3399cc', '#990066', '#cc3399', '#ff6600', '#ff9900', '#ffcc00'],
}

/**
 * GlowBorderCard - CSS-only animated glowing border card.
 *
 * Features a rotating conic gradient that creates an aurora-like glow
 * around the card edges. Uses @property for smooth angle animation
 * and respects prefers-reduced-motion.
 */
export const GlowBorderCard = React.forwardRef<HTMLDivElement, GlowBorderCardProps>(
  (
    {
      children,
      className,
      width = 'auto',
      height = 'auto',
      aspectRatio = 'auto',
      borderRadius = '1.125rem',
      animationDuration = 4,
      gradientColors,
      borderWidth = '1.25em',
      blurAmount = '0.75em',
      inset = '-1em',
      colorPreset = 'stellar',
      paused = false,
      style,
      ...props
    },
    ref
  ) => {
    const colors = gradientColors || colorPresets[colorPreset] || colorPresets.stellar

    const colorVars: Record<string, string> = {}
    for (let i = 0; i < 10; i++) {
      colorVars[`--glow-color-${i + 1}`] = colors[i % colors.length]
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden grid place-content-center isolate',
          'bg-[var(--surface)] backdrop-blur-md',
          className
        )}
        style={{
          width,
          height,
          aspectRatio,
          borderRadius,
          '--glow-animation-duration': `${animationDuration}s`,
          ...colorVars,
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        <div
          className={cn(
            'absolute -z-10 border-solid rounded-[inherit] glow-conic',
            paused && '[animation-play-state:paused]'
          )}
          style={{
            inset,
            borderWidth,
            filter: `blur(${blurAmount})`,
          }}
        />
        <div className="relative z-10 w-full h-full bg-transparent flex items-center justify-center p-4">
          {children}
        </div>
      </div>
    )
  }
)

GlowBorderCard.displayName = 'GlowBorderCard'

export default GlowBorderCard