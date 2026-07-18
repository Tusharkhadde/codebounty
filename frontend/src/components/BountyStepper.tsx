'use client'

import type { StepperStep } from '@/types'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  currentStep: StepperStep
  bountyId?: number
}

const steps: { key: StepperStep; label: string; description: string; icon: string }[] = [
  { key: 'created', label: 'Created', description: 'Bounty created', icon: '📝' },
  { key: 'funded', label: 'Funded', description: 'Funds secured', icon: '💰' },
  { key: 'pr_linked', label: 'PR Linked', description: 'PR submitted', icon: '🔗' },
  { key: 'verified', label: 'Verified', description: 'Merge verified', icon: '✅' },
  { key: 'paid', label: 'Paid', description: 'Payment sent', icon: '🎉' },
]

export function BountyStepper({ currentStep, bountyId }: Props) {
  const currentIdx = steps.findIndex(s => s.key === currentStep)
  const progressPercent = ((currentIdx + 1) / steps.length) * 100

  return (
    <Card className="p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-white">Bounty Status</h3>
          {bountyId && (
            <p className="text-sm text-gray-400 mt-0.5">
              #{bountyId}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white font-mono">
            {Math.round(progressPercent)}%
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wider">Complete</div>
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-white/5 rounded-full" />
        
        {/* Progress Line Fill with gradient */}
        <div 
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx
            const isCurrent = idx === currentIdx
            const isPending = idx > currentIdx

            return (
              <div 
                key={step.key} 
                className="flex flex-col items-center gap-3 stagger-item"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'text-lg transition-all duration-500 relative',
                    isCompleted
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/40 scale-110'
                      : isCurrent
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 ring-4 ring-purple-500/30 scale-110'
                        : 'bg-white/5 border-2 border-white/10'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6 text-white animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`${isCurrent ? 'animate-bounce' : 'opacity-60'}`}>{step.icon}</span>
                  )}
                  
                  {/* Pulse effect for current step */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-ping opacity-40" />
                  )}
                </div>

                {/* Step Label */}
                <div className="text-center px-2">
                  <span
                    className={`text-xs font-semibold block ${
                      isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {(isCurrent || isCompleted) && (
                    <span className="text-[10px] text-gray-400 block mt-1">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-8 pt-5 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              'w-2 h-2 rounded-full',
              currentStep === 'paid'
                ? 'bg-green-400 shadow-lg shadow-green-400/50'
                : currentStep === 'verified'
                  ? 'bg-purple-400'
                  : currentStep === 'pr_linked'
                    ? 'bg-blue-400'
                    : 'bg-white animate-pulse'
            )} />
            <span className="text-sm text-gray-300">
              {currentStep === 'paid' 
                ? 'Bounty completed! 🎉' 
                : `Currently: ${steps[currentIdx]?.label}`}
            </span>
          </div>
          {currentStep !== 'paid' && (
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Step {currentIdx + 1} of {steps.length}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
