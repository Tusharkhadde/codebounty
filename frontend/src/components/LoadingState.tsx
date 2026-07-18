'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: Props) {
  return (
    <Card className={cn('p-8 animate-fade-in-up', className)}>
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Enhanced spinner with gradient */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-transparent border-t-pink-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>

        {/* Loading text with shimmer effect */}
        <div className="text-center">
          <p className="text-white font-medium mb-1">{message}</p>
          <p className="text-xs text-gray-500">Please wait a moment</p>
        </div>

        {/* Shimmer dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500/60 animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-purple-500/60 animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-purple-500/60 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </Card>
  )
}
