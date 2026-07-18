'use client'

import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    positive: boolean
  }
  className?: string
  gradient?: string
}

export function StatsCard({ label, value, icon, trend, className, gradient }: Props) {
  return (
    <Card className={cn('group p-5 hover-lift', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 mb-2 font-medium">{label}</p>
          <p className="stat-value">{value}</p>
          
          {/* Trend Indicator */}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <svg 
                className={`w-3.5 h-3.5 ${trend.positive ? 'text-green-400' : 'text-red-400'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={trend.positive ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
              <span className={`text-xs font-semibold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          gradient ? `bg-gradient-to-br ${gradient}` : 'bg-white/10'
        }`}>
          <div className={gradient ? 'text-white' : 'text-gray-300'}>
            {icon}
          </div>
        </div>
      </div>

      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  )
}
