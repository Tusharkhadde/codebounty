'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ message, onRetry, className }: Props) {
  return (
    <Card className={cn('p-8 animate-fade-in-up', className)}>
      <div className="flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1">Something went wrong</h3>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            Try Again
          </Button>
        )}
      </div>
    </Card>
  )
}
